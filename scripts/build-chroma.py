#!/usr/bin/env python3
"""Build a local Chroma DB vector store with project context chunks.

Embeds all project source files into a Chroma DB collection.
Uses the default ONNX-based embedding function bundled with chromadb — fully local, no downloads.
"""

import os
import re
import sys
import time
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / ".context" / "chroma"

IGNORE_DIRS = {
    "node_modules", ".git", ".next", ".turbo", "dist",
    ".context", ".venv", ".vercel", "public", "out", "build",
    "__pycache__", ".pytest_cache", ".cache",
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".pdf", ".zip", ".tar", ".gz",
    ".db", ".db-journal", ".sqlite",
}

IGNORE_FILES = {
    "bun.lock", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".env", ".env.local", ".env.production",
}

MAX_FILE_SIZE = 512 * 1024


def should_ignore(path: Path, rel: str) -> bool:
    if path.name in IGNORE_FILES:
        return True
    if path.suffix in IGNORE_EXTENSIONS:
        return True
    for part in path.parts:
        if part in IGNORE_DIRS:
            return True
    return False


def chunk_file(file_path: Path, content: str) -> list[dict]:
    rel = str(file_path.relative_to(ROOT))
    ext = file_path.suffix
    lines = content.split("\n")

    if ext in (".ts", ".tsx", ".js", ".jsx", ".mjs", ".py"):
        return chunk_code(rel, lines, ext)
    elif ext == ".md":
        return chunk_markdown(rel, lines)
    else:
        return [{"file": rel, "start": 1, "end": len(lines), "content": content}]


def chunk_code(rel: str, lines: list[str], ext: str) -> list[dict]:
    chunks = []
    current = []
    start_line = 1

    if ext == ".py":
        decl_patterns = (
            re.compile(r"^\s*(async\s+)?def\s"),
            re.compile(r"^\s*class\s"),
        )
    else:
        decl_patterns = (
            re.compile(r"^\s*(export\s+)?(async\s+)?function\s"),
            re.compile(r"^\s*(export\s+)?class\s"),
            re.compile(r"^\s*(export\s+)?const\s+\w+\s*[:=]\s*(\(|async)"),
            re.compile(r"^\s*(export\s+)?default\s+(function|class)"),
            re.compile(r"^\s*interface\s"),
            re.compile(r"^\s*type\s"),
        )

    for i, line in enumerate(lines, 1):
        is_start = any(p.match(line) for p in decl_patterns)

        if is_start and current and len(current) > 3:
            chunks.append({
                "file": rel,
                "start": start_line,
                "end": i - 1,
                "content": "\n".join(current),
            })
            current = []
            start_line = i

        current.append(line)

    if current:
        chunks.append({
            "file": rel,
            "start": start_line,
            "end": len(lines),
            "content": "\n".join(current),
        })

    return chunks


def chunk_markdown(rel: str, lines: list[str]) -> list[dict]:
    chunks = []
    current = []
    start_line = 1

    for i, line in enumerate(lines, 1):
        if re.match(r"^##+\s", line) and len(current) > 5:
            chunks.append({
                "file": rel,
                "start": start_line,
                "end": i - 1,
                "content": "\n".join(current),
            })
            current = []
            start_line = i
        current.append(line)

    if current:
        chunks.append({
            "file": rel,
            "start": start_line,
            "end": len(lines),
            "content": "\n".join(current),
        })

    return chunks


def collect_files(root: Path) -> list[Path]:
    files = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        rel = str(path.relative_to(root))
        if should_ignore(path, rel):
            continue
        if path.stat().st_size > MAX_FILE_SIZE:
            continue
        files.append(path)
    return sorted(files)


def main():
    print("🔨 Building project context Chroma DB...")

    files = collect_files(ROOT)
    print(f"📁 Found {len(files)} files")

    all_chunks = []
    for fp in files:
        try:
            content = fp.read_text("utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        try:
            chunks = chunk_file(fp, content)
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"  ⚠ Error chunking {fp.relative_to(ROOT)}: {e}")

    print(f"🧩 Generated {len(all_chunks)} chunks")

    client = chromadb.PersistentClient(path=str(DB_PATH))

    try:
        client.delete_collection("project_context")
    except Exception:
        pass

    collection = client.create_collection(
        name="project_context",
        metadata={"hnsw:space": "cosine"},
    )

    batch_size = 100
    ids = []
    metadatas = []
    documents = []

    for i, chunk in enumerate(all_chunks):
        chunk_id = f"chunk_{i:06d}"
        ids.append(chunk_id)
        metadatas.append({
            "file": chunk["file"],
            "start_line": chunk["start"],
            "end_line": chunk["end"],
        })
        documents.append(chunk["content"])

        if len(ids) >= batch_size:
            collection.add(ids=ids, metadatas=metadatas, documents=documents)
            ids, metadatas, documents = [], [], []
            print(f"  📥 Inserted {i + 1}/{len(all_chunks)}", end="\r")

    if ids:
        collection.add(ids=ids, metadatas=metadatas, documents=documents)

    print(f"\n✅ Chroma DB built at {DB_PATH}")
    print(f"   Files: {len(files)} | Chunks: {len(all_chunks)} | Collection: project_context")


if __name__ == "__main__":
    main()

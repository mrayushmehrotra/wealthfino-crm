#!/usr/bin/env python3
"""Build lightweight per-commit project context snapshots.

This script creates small, plain-text files that summarize the repository
state at a commit. The output is designed to be fast to generate on low-end
machines and easy for an AI to load without scanning the whole repo.
"""

from __future__ import annotations

import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
import fnmatch

ROOT = Path(__file__).resolve().parent.parent
CONTEXT_DIR = ROOT / ".context"
COMMITS_DIR = CONTEXT_DIR / "commits"
LATEST_FILE = CONTEXT_DIR / "latest-context.md"
MANIFEST_FILE = CONTEXT_DIR / "manifest.json"

IGNORE_PREFIXES = (
    "node_modules/",
    ".next/",
    ".turbo/",
    "dist/",
    "build/",
    "out/",
    ".context/",
    ".venv/",
)


def run_git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def safe_run_git(*args: str) -> str:
    try:
        return run_git(*args)
    except subprocess.CalledProcessError:
        return ""


def get_commit() -> str:
    return run_git("rev-parse", "HEAD")


def get_commit_meta(commit: str) -> dict[str, str]:
    raw = run_git("show", "-s", "--format=%H%n%an%n%ad%n%s", "--date=iso-strict", commit)
    commit_hash, author, date, subject = raw.split("\n", 3)
    return {
        "hash": commit_hash,
        "author": author,
        "date": date,
        "subject": subject,
    }


def get_changed_files(commit: str) -> list[str]:
    raw = safe_run_git("diff-tree", "--no-commit-id", "--name-only", "-r", commit)
    files = [line for line in raw.splitlines() if line and not line.startswith(IGNORE_PREFIXES)]
    return sorted(files)


def get_stats(commit: str) -> dict[str, int]:
    raw = safe_run_git("show", "--stat", "--format=", "--numstat", commit)
    adds = deletes = 0
    for line in raw.splitlines():
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        a, d, path = parts
        if path.startswith(IGNORE_PREFIXES):
            continue
        try:
            adds += int(a) if a != "-" else 0
            deletes += int(d) if d != "-" else 0
        except ValueError:
            continue
    return {"additions": adds, "deletions": deletes}


def file_type_summary(files: list[str]) -> dict[str, int]:
    counts: Counter[str] = Counter()
    for path in files:
        ext = Path(path).suffix.lower() or "[no-ext]"
        counts[ext] += 1
    return dict(sorted(counts.items(), key=lambda item: (-item[1], item[0])))


def collect_key_modules(files: list[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for path in files:
        top = path.split("/", 1)[0]
        groups[top].append(path)
    for key in groups:
        groups[key] = groups[key][:50]
    return dict(sorted(groups.items()))


def collect_key_files() -> dict[str, list[str]]:
    tracked = safe_run_git("ls-files").splitlines()
    patterns = {
        "api": ["apps/web/app/api/**/route.ts"],
        "auth": ["apps/web/lib/auth.ts", "apps/web/app/(auth)/**"],
        "database": ["apps/web/lib/db.ts", "apps/web/prisma/**"],
        "dashboard": ["apps/web/app/(dashboard)/**"],
        "shared-ui": ["packages/ui/**"],
        "tests": ["**/*.test.ts", "**/*.test.tsx"],
        "scripts": ["scripts/*.py", "scripts/*.sh"],
    }

    groups: dict[str, list[str]] = {}
    for label, globs in patterns.items():
        matched = [
            path for path in tracked
            if any(fnmatch.fnmatch(path, pattern) for pattern in globs)
        ]
        if matched:
            groups[label] = matched[:40]
    return groups


def read_readme() -> str:
    readme = ROOT / "README.md"
    if not readme.exists():
        return ""
    text = readme.read_text("utf-8", errors="ignore")
    return "\n".join(text.splitlines()[:120])


def build_snapshot(commit: str) -> str:
    meta = get_commit_meta(commit)
    files = get_changed_files(commit)
    stats = get_stats(commit)
    file_types = file_type_summary(files)
    modules = collect_key_modules(files)
    key_files = collect_key_files()
    timestamp = datetime.now(timezone.utc).isoformat()

    lines = [
        f"# Context Snapshot",
        "",
        f"- Commit: `{meta['hash']}`",
        f"- Author: `{meta['author']}`",
        f"- Date: `{meta['date']}`",
        f"- Subject: `{meta['subject']}`",
        f"- Generated: `{timestamp}`",
        f"- Files changed: `{len(files)}`",
        f"- Additions: `{stats['additions']}`",
        f"- Deletions: `{stats['deletions']}`",
        "",
        "## What This App Is",
        "",
        read_readme() or "No README summary available.",
        "",
        "## Changed Files",
        "",
    ]

    if files:
        lines.extend(f"- `{path}`" for path in files)
    else:
        lines.append("- No tracked file changes found for this commit.")

    lines.extend([
        "",
        "## File Type Summary",
        "",
    ])
    for ext, count in file_types.items():
        lines.append(f"- `{ext}`: {count}")

    lines.extend([
        "",
        "## Top-Level Modules",
        "",
    ])
    for group, paths in modules.items():
        lines.append(f"- `{group}`")
        for path in paths[:8]:
            lines.append(f"  - `{path}`")

    lines.extend([
        "",
        "## Key Files",
        "",
    ])
    for group, paths in key_files.items():
        lines.append(f"- `{group}`")
        for path in paths[:12]:
            lines.append(f"  - `{path}`")

    lines.extend([
        "",
        "## AI Use",
        "",
        "Load this file first to understand the current commit, then inspect the referenced files directly.",
        "This snapshot is intentionally lightweight for low-end machines.",
        "",
    ])

    return "\n".join(lines)


def write_manifest(latest_commit: str, latest_file: Path) -> None:
    manifest = {
        "latest_commit": latest_commit,
        "latest_file": str(latest_file.relative_to(ROOT)),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    import json

    CONTEXT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    commit = get_commit()
    snapshot = build_snapshot(commit)

    COMMITS_DIR.mkdir(parents=True, exist_ok=True)
    latest_file = COMMITS_DIR / f"{commit}.md"
    latest_file.write_text(snapshot + "\n", encoding="utf-8")
    LATEST_FILE.write_text(snapshot + "\n", encoding="utf-8")
    write_manifest(commit, latest_file)

    print(f"✅ Wrote context snapshot for {commit}")
    print(f"   Snapshot: {latest_file}")
    print(f"   Latest:   {LATEST_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

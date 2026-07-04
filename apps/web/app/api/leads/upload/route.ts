import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const PHONE_ALIASES = ["phone", "mobile", "contact", "telephone", "tel", "whatsapp", "cell", "number"];

function splitCamelCase(word: string): string[] {
  return word
    .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function findCol(headers: string[], aliases: string[]) {
  return headers.findIndex((h) => aliases.some((a) => h === a || h.includes(a)));
}

export async function POST(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const raw = (await file.text()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    // ── Detect delimiter from first data row ──
    const firstData = lines[1]!;
    const delimScore: [string, number][] = [
      [",", (firstData.match(/,/g) || []).length],
      ["\t", (firstData.match(/\t/g) || []).length],
      [";", (firstData.match(/;/g) || []).length],
      ["|", (firstData.match(/\|/g) || []).length],
    ];
    delimScore.sort((a, b) => b[1] - a[1]);
    const delim = delimScore[0]![1] > 0 ? delimScore[0]![0] : null;

    // ── Parse a row into columns ──
    const parseRow = (row: string, d: string | null): string[] => {
      if (!d) return [row];
      const cols: string[] = [];
      let cur = "", q = false;
      for (const ch of row) {
        if (ch === '"') { q = !q; continue }
        if (ch === d && !q) { cols.push(cur.trim()); cur = ""; continue }
        cur += ch;
      }
      cols.push(cur.trim());
      return cols;
    };

    // ── Detect columns from a header string ──
    const detect = (headerStr: string, d: string | null) => {
      const cols = parseRow(headerStr, d).map(normalize);
      return {
        headers: cols,
        nameIdx: findCol(cols, ["name", "full name", "lead name", "contact name", "customer name", "first name"]),
        emailIdx: findCol(cols, ["email", "e mail", "email address", "email id"]),
        phoneIdx: findCol(cols, PHONE_ALIASES),
        sourceIdx: findCol(cols, ["source", "lead source"]),
      };
    };

    let { headers, nameIdx, emailIdx, phoneIdx, sourceIdx } = detect(lines[0]!, delim);

    // ── Fallback: try camelCase splitting (no delimiter detected) ──
    if (nameIdx === -1) {
      const ccHeaders = splitCamelCase(lines[0]!).join(" ");
      const cc = detect(ccHeaders, " ");
      if (cc.nameIdx !== -1) {
        const leads: { name: string; email: string | null; phone: string | null; source: string | null }[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = splitCamelCase(lines[i]!);
          const name = cols[cc.nameIdx] || "";
          if (!name) continue;
          leads.push({
            name,
            email: cc.emailIdx >= 0 ? cols[cc.emailIdx] || null : null,
            phone: cc.phoneIdx >= 0 ? cols[cc.phoneIdx] || null : null,
            source: cc.sourceIdx >= 0 ? cols[cc.sourceIdx] || null : null,
          });
        }
        if (leads.length > 0) {
          await prisma.lead.createMany({ data: leads });
          return NextResponse.json({ success: true, message: `${leads.length} leads imported successfully` });
        }
      }
      return NextResponse.json({ success: false, error: "CSV must have a 'name' column" }, { status: 400 });
    }

    // ── Normal path: parse all data rows ──
    const leads: { name: string; email: string | null; phone: string | null; source: string | null }[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]!, delim);
      const name = cols[nameIdx] || "";
      if (!name) { errors.push(`Row ${i + 1}: skipped (no name)`); continue }
      leads.push({
        name,
        email: emailIdx >= 0 ? cols[emailIdx] || null : null,
        phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
        source: sourceIdx >= 0 ? cols[sourceIdx] || null : null,
      });
    }

    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: "No valid leads found in CSV" }, { status: 400 });
    }

    await prisma.lead.createMany({ data: leads });

    return NextResponse.json({
      success: true,
      message: `${leads.length} leads imported successfully`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("CSV upload error:", err);
    return NextResponse.json({ success: false, error: "Failed to process CSV" }, { status: 500 });
  }
}

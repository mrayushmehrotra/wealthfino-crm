import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

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

    const text = await file.text();

    // Detect delimiter (comma, tab, semicolon)
    const firstLine = text.split("\n").find((l) => l.trim()) || "";
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const delim = tabCount > commaCount && tabCount > semiCount ? "\t"
      : semiCount > commaCount ? ";"
      : ",";

    const parseRow = (row: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]!;
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if (ch === delim && !inQuotes) { result.push(current.trim()); current = ""; continue }
        current += ch;
      }
      result.push(current.trim());
      return result;
    };

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    const normalizeHeader = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    const rawHeaders = parseRow(lines[0]!).map(normalizeHeader);
    const nameIdx = rawHeaders.findIndex((h) => h === "name" || h === "full name" || h === "lead name");
    const emailIdx = rawHeaders.findIndex((h) => h.includes("email"));
    const phoneIdx = rawHeaders.findIndex((h) =>
      [
        "phone",
        "phone number",
        "mobile",
        "mobile number",
        "contact",
        "contact number",
        "number",
        "telephone",
        "tel",
        "whatsapp",
      ].some((alias) => h === alias || h.includes(alias))
    );
    const sourceIdx = rawHeaders.findIndex((h) => h === "source" || h === "lead source");

    if (nameIdx === -1) {
      return NextResponse.json({ success: false, error: "CSV must have a 'name' column" }, { status: 400 });
    }

    const leads = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]!);
      const name = cols[nameIdx] || "";
      if (!name) {
        errors.push(`Row ${i + 1}: missing name, skipped`);
        continue;
      }
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

import { PDFParse } from "pdf-parse";

const MAX_CHARS = 24_000;

export async function extractResumeText(file: File): Promise<string> {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (
    type === "application/pdf" ||
    name.endsWith(".pdf")
  ) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return truncate(result.text ?? "");
    } finally {
      await parser.destroy();
    }
  }

  if (
    type === "text/plain" ||
    type === "text/markdown" ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return truncate(await file.text());
  }

  throw new Error("Upload a PDF or plain-text resume (.pdf, .txt, .md).");
}

function truncate(text: string) {
  const cleaned = text.replace(/\u0000/g, "").trim();
  if (!cleaned) {
    throw new Error("Could not read any text from that file.");
  }
  if (cleaned.length <= MAX_CHARS) {
    return cleaned;
  }
  return `${cleaned.slice(0, MAX_CHARS)}\n\n[Resume truncated for analysis]`;
}

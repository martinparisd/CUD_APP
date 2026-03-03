import jsPDF from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const PAGE_MARGIN = 20;
export const ACCENT_COLOR: [number, number, number] = [59, 47, 130];
export const HEADER_BG: [number, number, number] = [245, 243, 255];
export const TABLE_HEADER_BG: [number, number, number] = [59, 47, 130];
export const TABLE_HEADER_TEXT: [number, number, number] = [255, 255, 255];
export const MUTED_TEXT: [number, number, number] = [120, 120, 130];

export const baseTableStyles = { fontSize: 8, cellPadding: 2 };
export const baseHeadStyles = {
  fillColor: TABLE_HEADER_BG,
  textColor: TABLE_HEADER_TEXT,
  fontStyle: "bold" as const,
  fontSize: 8,
};
export const baseAlternateRowStyles = { fillColor: [248, 247, 255] as [number, number, number] };

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd/MM/yyyy", { locale: es }); }
  catch { return dateStr; }
}

export function boolLabel(v: boolean | null): string {
  if (v === null || v === undefined) return "—";
  return v ? "Sí" : "No";
}

export function val(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "—";
  return String(v);
}

export async function loadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  if (y > 260) { doc.addPage(); y = PAGE_MARGIN; }
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(PAGE_MARGIN, y, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), PAGE_MARGIN + 4, y + 5.8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  return y + 12;
}

export function addKeyValueGrid(doc: jsPDF, pairs: [string, string][], startY: number): number {
  let y = startY;
  const colWidth = 85;
  for (let i = 0; i < pairs.length; i += 2) {
    if (y > 275) { doc.addPage(); y = PAGE_MARGIN; }
    for (let col = 0; col < 2; col++) {
      const pair = pairs[i + col];
      if (!pair) continue;
      const x = PAGE_MARGIN + col * colWidth;
      doc.setFontSize(8); doc.setTextColor(...MUTED_TEXT); doc.setFont("helvetica", "normal");
      doc.text(pair[0], x, y);
      doc.setFontSize(10); doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "bold");
      doc.text(pair[1], x, y + 4.5);
    }
    y += 12;
  }
  doc.setFont("helvetica", "normal");
  return y;
}

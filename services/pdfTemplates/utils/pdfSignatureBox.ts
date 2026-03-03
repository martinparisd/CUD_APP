import jsPDF from "jspdf";
import { PAGE_MARGIN, ACCENT_COLOR, MUTED_TEXT } from "./pdfHelpers";

export function renderSignatureBox(doc: jsPDF, y: number, signers?: string[]): number {
  const validSigners = (signers ?? []).filter(Boolean);
  const hasSigners = validSigners.length > 0;
  const boxH = hasSigners ? 48 : 40;
  if (y + boxH + 20 > 270) { doc.addPage(); y = PAGE_MARGIN; }
  y += 6;
  const boxW = 170; const x = PAGE_MARGIN;
  doc.setDrawColor(...ACCENT_COLOR); doc.setLineWidth(0.4);
  doc.roundedRect(x, y, boxW, boxH, 2, 2, "S");
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...ACCENT_COLOR);
  doc.text("FIRMA DEL RESPONSABLE", x + 4, y + 6);
  if (hasSigners && validSigners.length <= 2) {
    const colW = (boxW - 8) / 2;
    validSigners.forEach((name, i) => {
      const colX = x + 4 + i * colW; const nameY = y + 18; const lineY = y + 34;
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text(name, colX, nameY);
      doc.setDrawColor(180, 180, 190); doc.setLineWidth(0.3);
      doc.line(colX, lineY, colX + colW - 8, lineY);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED_TEXT);
      doc.text("Firma y aclaración", colX, lineY + 4);
    });
    if (validSigners.length === 1) {
      const dateX = x + 4 + (boxW - 8) / 2; const lineY = y + 34;
      doc.setDrawColor(180, 180, 190); doc.setLineWidth(0.3);
      doc.line(dateX, lineY, dateX + (boxW - 8) / 2 - 8, lineY);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED_TEXT);
      doc.text("Fecha", dateX, lineY + 4);
    }
  } else {
    const lineY = y + 30;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED_TEXT);
    doc.setDrawColor(180, 180, 190); doc.setLineWidth(0.3);
    doc.line(x + 4, lineY, x + 90, lineY);
    doc.text("Firma y aclaración", x + 4, lineY + 4);
    doc.line(x + 100, lineY, x + 165, lineY);
    doc.text("Fecha", x + 100, lineY + 4);
  }
  doc.setTextColor(0, 0, 0);
  return y + boxH + 4;
}

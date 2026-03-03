import jsPDF from "jspdf";
import { PAGE_MARGIN, MUTED_TEXT } from "./pdfHelpers";

export function renderFormularioFooter(doc: jsPDF, tenantName: string, title: string): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(...MUTED_TEXT);
    doc.text(`${tenantName} — ${title} — Página ${i} de ${totalPages}`, 105, 286, { align: "center" });
    doc.setDrawColor(220, 220, 230); doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, 283, 210 - PAGE_MARGIN, 283);
  }
}

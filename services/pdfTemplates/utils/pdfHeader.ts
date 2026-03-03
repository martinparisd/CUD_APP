import jsPDF from "jspdf";
import { PAGE_MARGIN, ACCENT_COLOR, HEADER_BG, MUTED_TEXT, loadImageAsBase64 } from "./pdfHelpers";

export async function renderFormularioHeader(doc: jsPDF, tenant: any, title: string): Promise<number> {
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, 210, 42, "F");
  let logoLoaded = false;
  if (tenant.logo_url) {
    const logoBase64 = await loadImageAsBase64(tenant.logo_url);
    if (logoBase64) {
      try { doc.addImage(logoBase64, "PNG", PAGE_MARGIN, 6, 28, 28); logoLoaded = true; }
      catch { /* ignore */ }
    }
  }
  const textX = logoLoaded ? PAGE_MARGIN + 33 : PAGE_MARGIN;
  doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(...ACCENT_COLOR);
  doc.text(tenant.name, textX, 16);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED_TEXT);
  const orgDetails = [
    tenant.cuit ? `CUIT: ${tenant.cuit}` : null,
    [tenant.address, tenant.city, tenant.province].filter(Boolean).join(", ") || null,
    tenant.phone ? `Tel: ${tenant.phone}` : null,
    tenant.email,
  ].filter(Boolean);
  orgDetails.forEach((line, i) => { doc.text(line!, textX, 22 + i * 4); });
  const rightTextX = 210 - PAGE_MARGIN;
  doc.setFontSize(10); doc.setTextColor(...ACCENT_COLOR); doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), rightTextX, 14, { align: "right" });
  doc.setDrawColor(...ACCENT_COLOR); doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, 43, 210 - PAGE_MARGIN, 43);
  return 50;
}

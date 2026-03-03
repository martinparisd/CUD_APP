import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  addSectionTitle, addKeyValueGrid, val, formatDate,
  baseTableStyles, baseHeadStyles, baseAlternateRowStyles, PAGE_MARGIN,
} from "./pdfHelpers";
import { FIM_ITEMS, FIM_SCORE_LABELS } from "./fimConstants";

export function renderFimBody(doc: jsPDF, d: any, y: number): number {
  y = addSectionTitle(doc, "Formulario FIM", y);
  y = addKeyValueGrid(doc, [
    ["Fecha", formatDate(d.fecha)],
    ["Fecha ingreso", formatDate(d.fecha_ingreso)],
    ["Diagnóstico", val(d.diagnostico)],
    ["Institución", val(d.institucion)],
    ["Modalidad", val(d.modalidad)],
    ["Puntaje total", val(d.puntaje_total)],
  ], y);

  const items = (d.items && typeof d.items === "object") ? d.items : {};
  const tableData = FIM_ITEMS.map((item) => {
    const entry = items[String(item.num)];
    const puntaje = entry?.puntaje ?? entry?.score ?? null;
    const scoreLabel = (typeof puntaje === "number" && puntaje > 0)
      ? `${puntaje} — ${FIM_SCORE_LABELS[puntaje] ?? ""}` : "—";
    const descripcion = entry?.descripcion ?? "";
    return [String(item.num), item.label, item.category, scoreLabel, descripcion || "—"];
  });

  y = addSectionTitle(doc, "Ítems FIM", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Ítem", "Categoría", "Puntaje", "Descripción"]],
    body: tableData,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { ...baseTableStyles, cellPadding: 2, fontSize: 7 },
    headStyles: baseHeadStyles,
    alternateRowStyles: baseAlternateRowStyles,
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 30 }, 2: { cellWidth: 28 }, 3: { cellWidth: 35 }, 4: { cellWidth: 0 } },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  y = addKeyValueGrid(doc, [
    ["Evaluación institucional", val(d.evaluacion_institucional)],
  ], y);
  return y;
}

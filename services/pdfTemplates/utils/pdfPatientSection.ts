import jsPDF from "jspdf";
import { addSectionTitle, addKeyValueGrid, val } from "./pdfHelpers";

export function renderPatientSection(doc: jsPDF, paciente: any, y: number): number {
  y = addSectionTitle(doc, "Datos del Paciente", y);
  y = addKeyValueGrid(doc, [
    ["Paciente", [paciente.apellido, paciente.nombre].filter(Boolean).join(", ") || "—"],
    ["DNI", val(paciente.dni)],
    ["Obra Social", val(paciente.obra_social)],
  ], y);
  return y + 2;
}

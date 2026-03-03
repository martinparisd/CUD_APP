import jsPDF from "jspdf";
import { renderFormularioHeader } from "./utils/pdfHeader";
import { renderPatientSection } from "./utils/pdfPatientSection";
import { renderFimBody } from "./utils/pdfFimBody";
import { renderSignatureBox } from "./utils/pdfSignatureBox";
import { renderFormularioFooter } from "./utils/pdfFooter";
import { TenantInfo, PacienteBasic } from "./utils/pdfTypes";
import { FIM_ITEMS } from "./utils/fimConstants";

export interface FimFormData {
  fecha: string | null;
  fecha_ingreso: string | null;
  diagnostico: string | null;
  institucion: string | null;
  modalidad: string | null;
  puntaje_total: number | null;
  evaluacion_institucional: string | null;
  items?: Record<string, any>;
  item_1_alimentacion?: number | null;
  item_2_aseo_personal?: number | null;
  item_3_higiene?: number | null;
  item_4_vestido_superior?: number | null;
  item_5_vestido_inferior?: number | null;
  item_6_uso_bano?: number | null;
  item_7_control_intestinos?: number | null;
  item_8_control_vejiga?: number | null;
  item_9_transferencia_cama?: number | null;
  item_10_transferencia_bano?: number | null;
  item_11_transferencia_ducha?: number | null;
  item_12_marcha?: number | null;
  item_13_escaleras?: number | null;
  item_14_comprension?: number | null;
  item_15_expresion?: number | null;
  item_16_interaccion_social?: number | null;
  item_17_resolucion_problemas?: number | null;
  item_18_memoria?: number | null;
  firma_responsable_1?: string | null;
  firma_responsable_2?: string | null;
}

const COLUMN_MAPPING: Record<number, string> = {
  1: 'item_1_alimentacion',
  2: 'item_2_aseo_personal',
  3: 'item_3_higiene',
  4: 'item_4_vestido_superior',
  5: 'item_5_vestido_inferior',
  6: 'item_6_uso_bano',
  7: 'item_7_control_intestinos',
  8: 'item_8_control_vejiga',
  9: 'item_9_transferencia_cama',
  10: 'item_10_transferencia_bano',
  11: 'item_11_transferencia_ducha',
  12: 'item_12_marcha',
  13: 'item_13_escaleras',
  14: 'item_14_comprension',
  15: 'item_15_expresion',
  16: 'item_16_interaccion_social',
  17: 'item_17_resolucion_problemas',
  18: 'item_18_memoria',
};

function transformFormDataToItems(formData: FimFormData): Record<string, any> {
  const items: Record<string, any> = {};

  FIM_ITEMS.forEach((item) => {
    const columnName = COLUMN_MAPPING[item.num];
    const score = formData[columnName as keyof FimFormData];

    if (score !== null && score !== undefined) {
      items[String(item.num)] = {
        puntaje: score,
        score: score,
        descripcion: "",
      };
    }
  });

  if (formData.items && typeof formData.items === "object") {
    Object.keys(formData.items).forEach((key) => {
      const itemData = formData.items![key];
      if (itemData && typeof itemData === "object") {
        const itemNum = key.replace("item_", "");
        if (!items[itemNum]) {
          items[itemNum] = itemData;
        }
      }
    });
  }

  return items;
}

function calculateTotalScore(formData: FimFormData): number {
  if (formData.puntaje_total !== null && formData.puntaje_total !== undefined) {
    return formData.puntaje_total;
  }

  let total = 0;
  FIM_ITEMS.forEach((item) => {
    const columnName = COLUMN_MAPPING[item.num];
    const score = formData[columnName as keyof FimFormData];
    if (typeof score === "number" && score > 0) {
      total += score;
    }
  });

  return total;
}

export async function generateFimPDFWithJsPDF(
  tenant: TenantInfo,
  paciente: PacienteBasic,
  formData: FimFormData
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const title = "Formulario FIM";

  let y = await renderFormularioHeader(doc, tenant, title);

  y = renderPatientSection(doc, paciente, y);

  const items = transformFormDataToItems(formData);
  const totalScore = calculateTotalScore(formData);

  const enrichedFormData = {
    ...formData,
    items,
    puntaje_total: totalScore,
  };

  y = renderFimBody(doc, enrichedFormData, y);

  const signers: string[] = [];
  if (formData.firma_responsable_1) signers.push(formData.firma_responsable_1);
  if (formData.firma_responsable_2) signers.push(formData.firma_responsable_2);

  y = renderSignatureBox(doc, y, signers.length > 0 ? signers : undefined);

  renderFormularioFooter(doc, tenant.name, title);

  return doc;
}

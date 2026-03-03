export const FORMULARIO_FIM_FORM_ID = "formulario-fim-form";

export interface FimItemDef {
  num: number;
  label: string;
  category: string;
  placeholder: string;
}

export const FIM_CATEGORIES = [
  "Autocuidado",
  "Control de esfínteres",
  "Transferencias",
  "Locomoción",
  "Comunicación",
  "Conexión social",
] as const;

export const FIM_ITEMS: FimItemDef[] = [
  { num: 1, label: "Alimentación", category: "Autocuidado", placeholder: "..." },
  { num: 2, label: "Aseo personal", category: "Autocuidado", placeholder: "..." },
  { num: 3, label: "Higiene (baño)", category: "Autocuidado", placeholder: "..." },
  { num: 4, label: "Vestido parte superior", category: "Autocuidado", placeholder: "..." },
  { num: 5, label: "Vestido parte inferior", category: "Autocuidado", placeholder: "..." },
  { num: 6, label: "Uso del baño", category: "Autocuidado", placeholder: "..." },
  { num: 7, label: "Control de intestino", category: "Control de esfínteres", placeholder: "..." },
  { num: 8, label: "Control de vejiga", category: "Control de esfínteres", placeholder: "..." },
  { num: 9, label: "Transferencia cama/silla", category: "Transferencias", placeholder: "..." },
  { num: 10, label: "Transferencia al baño", category: "Transferencias", placeholder: "..." },
  { num: 11, label: "Transferencia ducha/bañera", category: "Transferencias", placeholder: "..." },
  { num: 12, label: "Marcha/silla de ruedas", category: "Locomoción", placeholder: "..." },
  { num: 13, label: "Escaleras", category: "Locomoción", placeholder: "..." },
  { num: 14, label: "Comprensión", category: "Comunicación", placeholder: "..." },
  { num: 15, label: "Expresión", category: "Comunicación", placeholder: "..." },
  { num: 16, label: "Interacción social", category: "Conexión social", placeholder: "..." },
  { num: 17, label: "Resolución de problemas", category: "Conexión social", placeholder: "..." },
  { num: 18, label: "Memoria", category: "Conexión social", placeholder: "..." },
];

export const FIM_SCORE_LABELS: Record<number, string> = {
  7: "Independencia completa",
  6: "Independencia modificada",
  5: "Supervisión/preparación",
  4: "Asistencia mínima (≥75%)",
  3: "Asistencia moderada (≥50%)",
  2: "Asistencia máxima (≥25%)",
  1: "Asistencia total (<25%)",
};

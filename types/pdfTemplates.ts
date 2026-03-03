export interface PDFTemplateData {
  formType: string;
  formData: Record<string, any>;
  afiliadoData: {
    nombre: string;
    apellido: string;
    dni: string;
    obra_social?: string;
  };
  tenantData: {
    nombre: string;
    cuit: string;
    direccion: string;
    telefono: string;
    email: string;
    logo_url?: string | null;
  };
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

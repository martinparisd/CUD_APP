export interface TenantInfo {
  name: string;
  cuit: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  logo_url: string | null;
}

export interface PacienteBasic {
  nombre: string | null;
  apellido: string | null;
  dni: string;
  obra_social?: string | null;
}

export type BodyRenderer = (doc: import("jspdf").default, data: any, y: number) => number;

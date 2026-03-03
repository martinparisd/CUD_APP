export interface Profesional {
  nombre: string;
  matricula: string;
  especialidad: string;
}

export interface EvaluacionInterdisciplinaria {
  id?: string;
  afiliado_id: string;
  tenant_id?: string;
  legajo_id?: string;
  fecha_evaluacion: string;
  profesionales: Profesional[];
  diagnostico_funcional?: string;
  area_motriz?: string;
  area_cognitiva?: string;
  area_comunicacion?: string;
  area_social?: string;
  area_avd?: string;
  nivel_autonomia?: string;
  apoyos_requeridos?: string;
  objetivos_terapeuticos?: string;
  recomendaciones?: string;
  pronostico?: string;
  observaciones?: string;
  requiere_dependencia?: boolean;
  requiere_transporte?: boolean;
  periodo_desde?: string;
  periodo_hasta?: string;
  sesiones_semanales?: number;
  duracion_minutos?: number;
  modalidad?: string;
  firmada?: boolean;
  archivo_pdf?: string | null;
  fecha_firma?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

import { EvaluacionInterdisciplinaria, Profesional } from './evaluacionInterdisciplinaria';

export { EvaluacionInterdisciplinaria, Profesional };

export interface AnexoConformidad {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  documento_tipo?: string;
  documento_numero?: string;
  anio?: number;
  prestaciones: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
  }>;
  firma?: string;
  aclaracion?: string;
  firmante_en_nombre_de?: string;
  firmante_firma?: string;
  firmante_aclaracion?: string;
  firmante_documento?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface FormularioFim {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  diagnostico?: string;
  institucion?: string;
  fecha_ingreso?: string;
  modalidad?: string;
  items: Record<string, number>;
  puntaje_total?: number;
  evaluacion_institucional?: string;
  firma_terapeuta?: string;
  firma_profesional?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface PedidoMedico {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  diagnostico?: string;
  institucion?: string;
  especialidad_institucion?: string;
  periodo_desde_institucion?: string;
  periodo_hasta_institucion?: string;
  tipo_jornada?: string;
  dependencia?: boolean;
  justificacion_medica?: string;
  maestro?: string;
  equipo?: string;
  periodo_desde_maestro?: string;
  periodo_hasta_maestro?: string;
  horas_semanales_maestro?: number;
  prestaciones_ambulatorias: Array<{
    tipo: string;
    frecuencia: string;
    duracion: string;
  }>;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface ResumenHistoriaClinica {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  diagnostico_patologia?: string;
  evolucion_cuadro_clinico?: string;
  antecedentes_tratamientos?: string;
  firma_medico?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface InformeTratamiento {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  prestacion?: string;
  prestador?: string;
  tipo_informe: string;
  informe?: string;
  firma_profesional?: string;
  sello_aclaracion?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface FormularioPlanTratamiento {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  prestacion?: string;
  periodo_desde?: string;
  periodo_hasta?: string;
  anio?: number;
  modalidad?: string;
  abordaje?: string;
  objetivos?: string;
  participacion_familia?: string;
  firma_profesional?: string;
  sello_aclaracion?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface PresupuestoPrestacion {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  fecha: string;
  prestacion?: string;
  periodo_desde?: string;
  periodo_hasta?: string;
  anio?: number;
  sesiones_semanales?: number;
  monto_sesion?: number;
  monto_mensual?: number;
  nombre_prestador?: string;
  domicilio_prestacion?: string;
  localidad?: string;
  provincia?: string;
  email_prestador?: string;
  telefono_prestador?: string;
  cuit_prestador?: string;
  cronograma_asistencia: Array<{
    dia: string;
    horario: string;
  }>;
  firma_profesional?: string;
  sello_aclaracion?: string;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export interface FichaPrestador {
  id?: string;
  afiliado_id: string;
  legajo_id?: string;
  tenant_id?: string;
  nombre_razon_social?: string;
  tipo_documento?: string;
  numero_documento?: string;
  cuit?: string;
  domicilio_calle?: string;
  domicilio_numero?: string;
  domicilio_torre?: string;
  domicilio_piso?: string;
  domicilio_dpto?: string;
  codigo_postal?: string;
  localidad?: string;
  provincia?: string;
  tipo_telefono?: string;
  numero_telefono?: string;
  email?: string;
  cbu?: string;
  tipo_cuenta?: string;
  numero_cuenta?: string;
  banco?: string;
  titulo_formacion?: string;
  especialidad?: string;
  numero_matricula?: string;
  fecha_vencimiento_matricula?: string;
  telefono_consultorio?: string;
  condicion_iva?: string;
  exencion_ingresos_brutos?: boolean;
  firma_sello?: string;
  fecha: string;
  anio?: number;
  archivo_adjunto?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  prestador_id?: string;
}

export type FormType =
  | 'evaluaciones_interdisciplinarias'
  | 'anexo_iii_conformidad'
  | 'formularios_fim'
  | 'pedidos_medicos'
  | 'resumenes_historia_clinica'
  | 'informes_tratamiento'
  | 'formularios_plan_tratamiento'
  | 'presupuestos_prestaciones'
  | 'fichas_prestador';

export type FormData =
  | EvaluacionInterdisciplinaria
  | AnexoConformidad
  | FormularioFim
  | PedidoMedico
  | ResumenHistoriaClinica
  | InformeTratamiento
  | FormularioPlanTratamiento
  | PresupuestoPrestacion
  | FichaPrestador;

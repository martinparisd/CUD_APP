export interface FormTableConfig {
  tableName: string;
  displayName: string;
  routeName: string;
}

export const FORM_TABLE_MAP: Record<string, FormTableConfig> = {
  'evaluacion-interdisciplinaria': {
    tableName: 'evaluaciones_interdisciplinarias',
    displayName: 'Evaluación Interdisciplinaria',
    routeName: 'evaluacion-interdisciplinaria',
  },
  'anexo-conformidad': {
    tableName: 'anexo_iii_conformidad',
    displayName: 'Anexo III Conformidad Prestacional',
    routeName: 'anexo-conformidad',
  },
  'formulario-fim': {
    tableName: 'formularios_fim',
    displayName: 'Formulario de FIM',
    routeName: 'formulario-fim',
  },
  'formulario-pedido-medico': {
    tableName: 'pedidos_medicos',
    displayName: 'Formulario Pedido Médico',
    routeName: 'formulario-pedido-medico',
  },
  'resumen-historia-clinica': {
    tableName: 'resumenes_historia_clinica',
    displayName: 'Resumen Historia Clínica',
    routeName: 'resumen-historia-clinica',
  },
  're158-informe': {
    tableName: 'informes_tratamiento',
    displayName: 'RE158 Informe',
    routeName: 're158-informe',
  },
  're159-plan-tratamiento': {
    tableName: 'formularios_plan_tratamiento',
    displayName: 'RE159 Plan de Tratamiento',
    routeName: 're159-plan-tratamiento',
  },
  're160-presupuesto': {
    tableName: 'presupuestos_prestaciones',
    displayName: 'RE160 Presupuesto',
    routeName: 're160-presupuesto',
  },
  're161-ficha-prestador': {
    tableName: 'fichas_prestador',
    displayName: 'RE161 Ficha del Prestador',
    routeName: 're161-ficha-prestador',
  },
};

export function getFormTableConfig(routeName: string): FormTableConfig | undefined {
  console.log('getFormTableConfig called with:', routeName);
  console.log('Available keys:', Object.keys(FORM_TABLE_MAP));
  const result = FORM_TABLE_MAP[routeName];
  console.log('Result:', result);
  return result;
}

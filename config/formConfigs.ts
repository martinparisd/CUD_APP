import { FormConfig } from '@/types/formFields';

export const evaluacionInterdisciplinariaConfig: FormConfig = {
  tableName: 'evaluaciones_interdisciplinarias',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha_evaluacion',
          type: 'date',
          label: 'Fecha de Evaluación',
          required: true,
        },
        {
          name: 'diagnostico_funcional',
          type: 'textarea',
          label: 'Diagnóstico Funcional',
          required: false,
          rows: 4,
        },
      ],
    },
    {
      title: 'Áreas de Evaluación',
      fields: [
        {
          name: 'area_motriz',
          type: 'textarea',
          label: 'Área Motriz',
          required: false,
          rows: 3,
        },
        {
          name: 'area_cognitiva',
          type: 'textarea',
          label: 'Área Cognitiva',
          required: false,
          rows: 3,
        },
        {
          name: 'area_comunicacion',
          type: 'textarea',
          label: 'Área de Comunicación',
          required: false,
          rows: 3,
        },
        {
          name: 'area_social',
          type: 'textarea',
          label: 'Área Social',
          required: false,
          rows: 3,
        },
        {
          name: 'area_avd',
          type: 'textarea',
          label: 'Área AVD (Actividades de Vida Diaria)',
          required: false,
          rows: 3,
        },
      ],
    },
    {
      title: 'Autonomía y Apoyos',
      fields: [
        {
          name: 'nivel_autonomia',
          type: 'textarea',
          label: 'Nivel de Autonomía',
          required: false,
          rows: 3,
        },
        {
          name: 'apoyos_requeridos',
          type: 'textarea',
          label: 'Apoyos Requeridos',
          required: false,
          rows: 3,
        },
        {
          name: 'requiere_dependencia',
          type: 'boolean',
          label: 'Requiere Dependencia',
          required: false,
        },
        {
          name: 'requiere_transporte',
          type: 'boolean',
          label: 'Requiere Transporte',
          required: false,
        },
      ],
    },
    {
      title: 'Plan Terapéutico',
      fields: [
        {
          name: 'objetivos_terapeuticos',
          type: 'textarea',
          label: 'Objetivos Terapéuticos',
          required: false,
          rows: 4,
        },
        {
          name: 'recomendaciones',
          type: 'textarea',
          label: 'Recomendaciones',
          required: false,
          rows: 4,
        },
        {
          name: 'pronostico',
          type: 'textarea',
          label: 'Pronóstico',
          required: false,
          rows: 3,
        },
        {
          name: 'periodo_desde',
          type: 'date',
          label: 'Período Desde',
          required: false,
        },
        {
          name: 'periodo_hasta',
          type: 'date',
          label: 'Período Hasta',
          required: false,
        },
        {
          name: 'sesiones_semanales',
          type: 'number',
          label: 'Sesiones Semanales',
          required: false,
        },
        {
          name: 'duracion_minutos',
          type: 'number',
          label: 'Duración (minutos)',
          required: false,
        },
        {
          name: 'modalidad',
          type: 'select',
          label: 'Modalidad',
          required: false,
          options: [
            { label: 'Individual', value: 'individual' },
            { label: 'Grupal', value: 'grupal' },
            { label: 'Mixta', value: 'mixta' },
          ],
        },
      ],
    },
    {
      title: 'Observaciones',
      fields: [
        {
          name: 'observaciones',
          type: 'textarea',
          label: 'Observaciones Adicionales',
          required: false,
          rows: 4,
        },
      ],
    },
  ],
};

export const resumenHistoriaClinicaConfig: FormConfig = {
  tableName: 'resumenes_historia_clinica',
  sections: [
    {
      title: 'Información del Resumen',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'diagnostico_patologia',
          type: 'textarea',
          label: 'Diagnóstico / Patología',
          required: false,
          rows: 4,
        },
        {
          name: 'evolucion_cuadro_clinico',
          type: 'textarea',
          label: 'Evolución del Cuadro Clínico',
          required: false,
          rows: 4,
        },
        {
          name: 'antecedentes_tratamientos',
          type: 'textarea',
          label: 'Antecedentes y Tratamientos',
          required: false,
          rows: 4,
        },
      ],
    },
  ],
};

export const pedidoMedicoConfig: FormConfig = {
  tableName: 'pedidos_medicos',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'diagnostico',
          type: 'textarea',
          label: 'Diagnóstico',
          required: false,
          rows: 3,
        },
      ],
    },
    {
      title: 'Institución',
      fields: [
        {
          name: 'institucion',
          type: 'text',
          label: 'Institución',
          required: false,
        },
        {
          name: 'especialidad_institucion',
          type: 'text',
          label: 'Especialidad',
          required: false,
        },
        {
          name: 'periodo_desde_institucion',
          type: 'text',
          label: 'Período Desde',
          required: false,
        },
        {
          name: 'periodo_hasta_institucion',
          type: 'text',
          label: 'Período Hasta',
          required: false,
        },
        {
          name: 'tipo_jornada',
          type: 'select',
          label: 'Tipo de Jornada',
          required: false,
          options: [
            { label: 'Simple', value: 'simple' },
            { label: 'Doble', value: 'doble' },
            { label: 'Completa', value: 'completa' },
          ],
        },
        {
          name: 'dependencia',
          type: 'boolean',
          label: 'Requiere Dependencia',
          required: false,
        },
      ],
    },
    {
      title: 'Justificación y Maestro de Apoyo',
      fields: [
        {
          name: 'justificacion_medica',
          type: 'textarea',
          label: 'Justificación Médica',
          required: false,
          rows: 4,
        },
        {
          name: 'maestro',
          type: 'text',
          label: 'Maestro de Apoyo',
          required: false,
        },
        {
          name: 'equipo',
          type: 'text',
          label: 'Equipo',
          required: false,
        },
        {
          name: 'periodo_desde_maestro',
          type: 'text',
          label: 'Período Desde',
          required: false,
        },
        {
          name: 'periodo_hasta_maestro',
          type: 'text',
          label: 'Período Hasta',
          required: false,
        },
        {
          name: 'horas_semanales_maestro',
          type: 'number',
          label: 'Horas Semanales',
          required: false,
          decimal: true,
        },
      ],
    },
  ],
};

export const anexoConformidadConfig: FormConfig = {
  tableName: 'anexo_iii_conformidad',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'documento_tipo',
          type: 'select',
          label: 'Tipo de Documento',
          required: false,
          options: [
            { label: 'DNI', value: 'DNI' },
            { label: 'Pasaporte', value: 'Pasaporte' },
            { label: 'LE', value: 'LE' },
            { label: 'LC', value: 'LC' },
          ],
        },
        {
          name: 'documento_numero',
          type: 'text',
          label: 'Número de Documento',
          required: false,
        },
        {
          name: 'anio',
          type: 'number',
          label: 'Año',
          required: false,
        },
      ],
    },
    {
      title: 'Prestaciones',
      fields: [
        {
          name: 'prestaciones',
          type: 'jsonb',
          label: 'Prestaciones',
          required: true,
          itemTemplate: {
            codigo: '',
            descripcion: '',
            cantidad: 0,
          },
          itemLabels: {
            codigo: 'Código',
            descripcion: 'Descripción',
            cantidad: 'Cantidad',
          },
        },
      ],
    },
    {
      title: 'Firmas',
      fields: [
        {
          name: 'firma',
          type: 'signature',
          label: 'Firma',
          required: false,
        },
        {
          name: 'aclaracion',
          type: 'text',
          label: 'Aclaración',
          required: false,
        },
        {
          name: 'firmante_en_nombre_de',
          type: 'text',
          label: 'Firmante en nombre de',
          required: false,
        },
        {
          name: 'firmante_firma',
          type: 'signature',
          label: 'Firma del Firmante',
          required: false,
        },
        {
          name: 'firmante_aclaracion',
          type: 'text',
          label: 'Aclaración del Firmante',
          required: false,
        },
        {
          name: 'firmante_documento',
          type: 'text',
          label: 'Documento del Firmante',
          required: false,
        },
      ],
    },
  ],
};

export const formularioFIMConfig: FormConfig = {
  tableName: 'formularios_fim',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'diagnostico',
          type: 'textarea',
          label: 'Diagnóstico',
          required: false,
          rows: 3,
        },
        {
          name: 'institucion',
          type: 'text',
          label: 'Institución',
          required: false,
        },
        {
          name: 'fecha_ingreso',
          type: 'date',
          label: 'Fecha de Ingreso',
          required: false,
        },
        {
          name: 'modalidad',
          type: 'select',
          label: 'Modalidad',
          required: false,
          options: [
            { label: 'Ingreso', value: 'ingreso' },
            { label: 'Egreso', value: 'egreso' },
            { label: 'Seguimiento', value: 'seguimiento' },
          ],
        },
      ],
    },
    {
      title: 'Items de Evaluación FIM',
      fields: [
        {
          name: 'items',
          type: 'jsonb',
          label: 'Items FIM',
          required: true,
        },
      ],
    },
    {
      title: 'Evaluación y Firmas',
      fields: [
        {
          name: 'evaluacion_institucional',
          type: 'textarea',
          label: 'Evaluación Institucional',
          placeholder: 'Escriba en base a la evaluación fisiátrica y neuropsicológica realizada, los niveles funcionales neuro-locomotores y cognitivos del paciente.',
          required: false,
          rows: 4,
        },
        {
          name: 'firma_terapeuta',
          type: 'signature',
          label: 'Firma del Terapeuta',
          required: false,
        },
        {
          name: 'firma_profesional',
          type: 'signature',
          label: 'Firma del Profesional',
          required: false,
        },
      ],
    },
  ],
};

export const informeTratamientoConfig: FormConfig = {
  tableName: 'informes_tratamiento',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'prestacion',
          type: 'text',
          label: 'Prestación',
          required: false,
        },
        {
          name: 'prestador',
          type: 'text',
          label: 'Prestador',
          required: false,
        },
        {
          name: 'tipo_informe',
          type: 'select',
          label: 'Tipo de Informe',
          required: true,
          options: [
            { label: 'Inicial', value: 'inicial' },
            { label: 'Evolución', value: 'evolucion' },
            { label: 'Alta', value: 'alta' },
          ],
        },
      ],
    },
    {
      title: 'Informe',
      fields: [
        {
          name: 'informe',
          type: 'textarea',
          label: 'Informe',
          required: false,
          rows: 8,
        },
      ],
    },
    {
      title: 'Firmas',
      fields: [
        {
          name: 'firma_profesional',
          type: 'signature',
          label: 'Firma del Profesional',
          required: false,
        },
        {
          name: 'sello_aclaracion',
          type: 'text',
          label: 'Sello y Aclaración',
          required: false,
        },
      ],
    },
  ],
};

export const planTratamientoConfig: FormConfig = {
  tableName: 'formularios_plan_tratamiento',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'prestacion',
          type: 'text',
          label: 'Prestación',
          required: false,
        },
        {
          name: 'periodo_desde',
          type: 'date',
          label: 'Período Desde',
          required: false,
        },
        {
          name: 'periodo_hasta',
          type: 'date',
          label: 'Período Hasta',
          required: false,
        },
        {
          name: 'anio',
          type: 'number',
          label: 'Año',
          required: false,
        },
      ],
    },
    {
      title: 'Plan de Tratamiento',
      fields: [
        {
          name: 'modalidad',
          type: 'select',
          label: 'Modalidad',
          required: false,
          options: [
            { label: 'Individual', value: 'individual' },
            { label: 'Grupal', value: 'grupal' },
            { label: 'Mixta', value: 'mixta' },
          ],
        },
        {
          name: 'abordaje',
          type: 'textarea',
          label: 'Abordaje',
          required: false,
          rows: 4,
        },
        {
          name: 'objetivos',
          type: 'textarea',
          label: 'Objetivos',
          required: false,
          rows: 4,
        },
        {
          name: 'participacion_familia',
          type: 'textarea',
          label: 'Participación de la Familia',
          required: false,
          rows: 3,
        },
      ],
    },
    {
      title: 'Firmas',
      fields: [
        {
          name: 'firma_profesional',
          type: 'signature',
          label: 'Firma del Profesional',
          required: false,
        },
        {
          name: 'sello_aclaracion',
          type: 'text',
          label: 'Sello y Aclaración',
          required: false,
        },
      ],
    },
  ],
};

export const presupuestoPrestacionesConfig: FormConfig = {
  tableName: 'presupuestos_prestaciones',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'prestacion',
          type: 'text',
          label: 'Prestación',
          required: false,
        },
        {
          name: 'periodo_desde',
          type: 'date',
          label: 'Período Desde',
          required: false,
        },
        {
          name: 'periodo_hasta',
          type: 'date',
          label: 'Período Hasta',
          required: false,
        },
        {
          name: 'anio',
          type: 'number',
          label: 'Año',
          required: false,
        },
      ],
    },
    {
      title: 'Detalles del Presupuesto',
      fields: [
        {
          name: 'sesiones_semanales',
          type: 'number',
          label: 'Sesiones Semanales',
          required: false,
          decimal: true,
        },
        {
          name: 'monto_sesion',
          type: 'number',
          label: 'Monto por Sesión',
          required: false,
          decimal: true,
        },
        {
          name: 'monto_mensual',
          type: 'number',
          label: 'Monto Mensual',
          required: false,
          decimal: true,
        },
      ],
    },
    {
      title: 'Datos del Prestador',
      fields: [
        {
          name: 'nombre_prestador',
          type: 'text',
          label: 'Nombre del Prestador',
          required: false,
        },
        {
          name: 'domicilio_prestacion',
          type: 'text',
          label: 'Domicilio de Prestación',
          required: false,
        },
        {
          name: 'localidad',
          type: 'text',
          label: 'Localidad',
          required: false,
        },
        {
          name: 'provincia',
          type: 'text',
          label: 'Provincia',
          required: false,
        },
        {
          name: 'email_prestador',
          type: 'text',
          label: 'Email del Prestador',
          required: false,
        },
        {
          name: 'telefono_prestador',
          type: 'text',
          label: 'Teléfono del Prestador',
          required: false,
        },
        {
          name: 'cuit_prestador',
          type: 'text',
          label: 'CUIT del Prestador',
          required: false,
        },
      ],
    },
    {
      title: 'Cronograma',
      fields: [
        {
          name: 'cronograma_asistencia',
          type: 'jsonb',
          label: 'Cronograma de Asistencia',
          required: true,
          itemTemplate: {
            dia: '',
            horario: '',
          },
          itemLabels: {
            dia: 'Día',
            horario: 'Horario',
          },
        },
      ],
    },
    {
      title: 'Firmas',
      fields: [
        {
          name: 'firma_profesional',
          type: 'signature',
          label: 'Firma del Profesional',
          required: false,
        },
        {
          name: 'sello_aclaracion',
          type: 'text',
          label: 'Sello y Aclaración',
          required: false,
        },
      ],
    },
  ],
};

export const fichaPrestadorConfig: FormConfig = {
  tableName: 'fichas_prestador',
  sections: [
    {
      title: 'Información General',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
        },
        {
          name: 'nombre_razon_social',
          type: 'text',
          label: 'Nombre / Razón Social',
          required: false,
        },
        {
          name: 'tipo_documento',
          type: 'select',
          label: 'Tipo de Documento',
          required: false,
          options: [
            { label: 'DNI', value: 'DNI' },
            { label: 'CI', value: 'CI' },
            { label: 'CUIT', value: 'CUIT' },
          ],
        },
        {
          name: 'numero_documento',
          type: 'text',
          label: 'Número de Documento',
          required: false,
        },
        {
          name: 'cuit',
          type: 'text',
          label: 'CUIT',
          required: false,
        },
      ],
    },
    {
      title: 'Domicilio',
      fields: [
        {
          name: 'domicilio_calle',
          type: 'text',
          label: 'Calle',
          required: false,
        },
        {
          name: 'domicilio_numero',
          type: 'text',
          label: 'Número',
          required: false,
        },
        {
          name: 'domicilio_torre',
          type: 'text',
          label: 'Torre',
          required: false,
        },
        {
          name: 'domicilio_piso',
          type: 'text',
          label: 'Piso',
          required: false,
        },
        {
          name: 'domicilio_dpto',
          type: 'text',
          label: 'Departamento',
          required: false,
        },
        {
          name: 'codigo_postal',
          type: 'text',
          label: 'Código Postal',
          required: false,
        },
        {
          name: 'localidad',
          type: 'text',
          label: 'Localidad',
          required: false,
        },
        {
          name: 'provincia',
          type: 'text',
          label: 'Provincia',
          required: false,
        },
      ],
    },
    {
      title: 'Contacto',
      fields: [
        {
          name: 'tipo_telefono',
          type: 'select',
          label: 'Tipo de Teléfono',
          required: false,
          options: [
            { label: 'Celular', value: 'celular' },
            { label: 'Fijo', value: 'fijo' },
          ],
        },
        {
          name: 'numero_telefono',
          type: 'text',
          label: 'Número de Teléfono',
          required: false,
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email',
          required: false,
        },
        {
          name: 'telefono_consultorio',
          type: 'text',
          label: 'Teléfono del Consultorio',
          required: false,
        },
      ],
    },
    {
      title: 'Datos Bancarios',
      fields: [
        {
          name: 'cbu',
          type: 'text',
          label: 'CBU',
          required: false,
        },
        {
          name: 'tipo_cuenta',
          type: 'select',
          label: 'Tipo de Cuenta',
          required: false,
          options: [
            { label: 'Caja de Ahorro', value: 'caja_ahorro' },
            { label: 'Cuenta Corriente', value: 'cuenta_corriente' },
          ],
        },
        {
          name: 'numero_cuenta',
          type: 'text',
          label: 'Número de Cuenta',
          required: false,
        },
        {
          name: 'banco',
          type: 'text',
          label: 'Banco',
          required: false,
        },
      ],
    },
    {
      title: 'Datos Profesionales',
      fields: [
        {
          name: 'titulo_formacion',
          type: 'text',
          label: 'Título de Formación',
          required: false,
        },
        {
          name: 'especialidad',
          type: 'text',
          label: 'Especialidad',
          required: false,
        },
        {
          name: 'numero_matricula',
          type: 'text',
          label: 'Número de Matrícula',
          required: false,
        },
        {
          name: 'fecha_vencimiento_matricula',
          type: 'date',
          label: 'Fecha de Vencimiento de Matrícula',
          required: false,
        },
      ],
    },
    {
      title: 'Información Fiscal',
      fields: [
        {
          name: 'condicion_iva',
          type: 'select',
          label: 'Condición IVA',
          required: false,
          options: [
            { label: 'Responsable Inscripto', value: 'responsable_inscripto' },
            { label: 'Monotributista', value: 'monotributista' },
            { label: 'Exento', value: 'exento' },
          ],
        },
        {
          name: 'exencion_ingresos_brutos',
          type: 'boolean',
          label: 'Exención de Ingresos Brutos',
          required: false,
        },
        {
          name: 'anio',
          type: 'number',
          label: 'Año',
          required: false,
        },
      ],
    },
    {
      title: 'Firma',
      fields: [
        {
          name: 'firma_sello',
          type: 'signature',
          label: 'Firma y Sello',
          required: false,
        },
      ],
    },
  ],
};

export const formConfigs: Record<string, FormConfig> = {
  'evaluaciones_interdisciplinarias': evaluacionInterdisciplinariaConfig,
  'resumenes_historia_clinica': resumenHistoriaClinicaConfig,
  'pedidos_medicos': pedidoMedicoConfig,
  'anexo_iii_conformidad': anexoConformidadConfig,
  'formularios_fim': formularioFIMConfig,
  'informes_tratamiento': informeTratamientoConfig,
  'formularios_plan_tratamiento': planTratamientoConfig,
  'presupuestos_prestaciones': presupuestoPrestacionesConfig,
  'fichas_prestador': fichaPrestadorConfig,
};

console.log('formConfigs initialized with keys:', Object.keys(formConfigs));

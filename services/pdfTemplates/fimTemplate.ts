import { PDFTemplateData } from '@/types/pdfTemplates';

interface FIMItemData {
  score?: number;
  notes?: string;
}

const FIM_ITEMS = [
  { number: 1, label: 'Alimentación', category: 'Autocuidado' },
  { number: 2, label: 'Aseo personal', category: 'Autocuidado' },
  { number: 3, label: 'Higiene (baño)', category: 'Autocuidado' },
  { number: 4, label: 'Vestido parte superior', category: 'Autocuidado' },
  { number: 5, label: 'Vestido parte inferior', category: 'Autocuidado' },
  { number: 6, label: 'Uso del baño', category: 'Autocuidado' },
  { number: 7, label: 'Control de intestino', category: 'Control de esfínteres' },
  { number: 8, label: 'Control de vejiga', category: 'Control de esfínteres' },
  { number: 9, label: 'Transferencia cama/silla', category: 'Transferencias' },
  { number: 10, label: 'Transferencia al baño', category: 'Transferencias' },
  { number: 11, label: 'Transferencia ducha/bañera', category: 'Transferencias' },
  { number: 12, label: 'Marcha/silla de ruedas', category: 'Locomoción' },
  { number: 13, label: 'Escaleras', category: 'Locomoción' },
  { number: 14, label: 'Comprensión', category: 'Comunicación' },
  { number: 15, label: 'Expresión', category: 'Comunicación' },
  { number: 16, label: 'Interacción social', category: 'Conexión social' },
  { number: 17, label: 'Resolución de problemas', category: 'Conexión social' },
  { number: 18, label: 'Memoria', category: 'Conexión social' },
];

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getFIMItemData(items: Record<string, FIMItemData | number>, itemKey: string): { score: string; notes: string } {
  const itemData = items?.[itemKey];

  if (!itemData) {
    return { score: '—', notes: '—' };
  }

  if (typeof itemData === 'number') {
    return { score: itemData.toString(), notes: '—' };
  }

  return {
    score: itemData.score ? itemData.score.toString() : '—',
    notes: itemData.notes || '—',
  };
}

export function generateFIMPDF(data: PDFTemplateData): string {
  const { formData, afiliadoData, tenantData } = data;

  const items = formData.items || {};

  const itemRows = FIM_ITEMS.map((item) => {
    const itemKey = `item_${item.number}`;
    const itemData = getFIMItemData(items, itemKey);

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #374151;">${item.number}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #374151;">${item.label}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #374151;">${item.category}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #374151;">${itemData.score}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 13px;">${itemData.notes}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulario FIM - ${afiliadoData.apellido}, ${afiliadoData.nombre}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1F2937;
      background: white;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 3px solid #4C3D9F;
      margin-bottom: 30px;
    }

    .header-left h1 {
      font-size: 32px;
      font-weight: 700;
      color: #4C3D9F;
      margin-bottom: 8px;
    }

    .header-left p {
      font-size: 13px;
      color: #6B7280;
      line-height: 1.6;
    }

    .header-right {
      text-align: right;
    }

    .header-right h2 {
      font-size: 18px;
      font-weight: 600;
      color: #4C3D9F;
    }

    .section {
      background: #F3F4F6;
      padding: 16px 20px;
      margin-bottom: 24px;
    }

    .section-title {
      background: #4C3D9F;
      color: white;
      padding: 12px 20px;
      font-size: 16px;
      font-weight: 600;
      margin: 0 -20px 16px -20px;
    }

    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .field {
      margin-bottom: 12px;
    }

    .field-label {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 4px;
    }

    .field-value {
      font-size: 15px;
      font-weight: 600;
      color: #1F2937;
    }

    .table-container {
      margin-bottom: 24px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    thead {
      background: #4C3D9F;
      color: white;
    }

    th {
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }

    th.center {
      text-align: center;
    }

    tbody tr:nth-child(even) {
      background: #F9FAFB;
    }

    .evaluation-section {
      background: #FEF3C7;
      padding: 20px;
      margin-bottom: 24px;
      border-left: 4px solid #F59E0B;
    }

    .evaluation-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #92400E;
      margin-bottom: 8px;
    }

    .evaluation-section p {
      color: #78350F;
      line-height: 1.6;
    }

    .signature-section {
      border: 2px solid #4C3D9F;
      padding: 24px;
      margin-top: 40px;
    }

    .signature-title {
      font-size: 16px;
      font-weight: 600;
      color: #4C3D9F;
      margin-bottom: 24px;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .signature-box {
      text-align: center;
    }

    .signature-name {
      font-size: 15px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 40px;
    }

    .signature-line {
      border-top: 1px solid #9CA3AF;
      padding-top: 8px;
      font-size: 12px;
      color: #6B7280;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <!-- Page 1 -->
  <div class="header">
    <div class="header-left">
      <h1>${tenantData.nombre}</h1>
      <p>
        CUIT: ${tenantData.cuit}<br>
        ${tenantData.direccion}<br>
        Tel: ${tenantData.telefono}<br>
        ${tenantData.email}
      </p>
    </div>
    <div class="header-right">
      <h2>FORMULARIO FIM</h2>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DATOS DEL PACIENTE</div>
    <div class="section-grid">
      <div>
        <div class="field">
          <div class="field-label">Paciente</div>
          <div class="field-value">${afiliadoData.apellido}, ${afiliadoData.nombre}</div>
        </div>
        <div class="field">
          <div class="field-label">Obra Social</div>
          <div class="field-value">${afiliadoData.obra_social || '—'}</div>
        </div>
      </div>
      <div>
        <div class="field">
          <div class="field-label">DNI</div>
          <div class="field-value">${afiliadoData.dni}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">FORMULARIO FIM</div>
    <div class="section-grid">
      <div class="field">
        <div class="field-label">Fecha</div>
        <div class="field-value">${formatDate(formData.fecha)}</div>
      </div>
      <div class="field">
        <div class="field-label">Fecha ingreso</div>
        <div class="field-value">${formatDate(formData.fecha_ingreso)}</div>
      </div>
      <div class="field">
        <div class="field-label">Diagnóstico</div>
        <div class="field-value">${formData.diagnostico || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Institución</div>
        <div class="field-value">${formData.institucion || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Modalidad</div>
        <div class="field-value">${formData.modalidad || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Puntaje total</div>
        <div class="field-value">${formData.puntaje_total || '0'}</div>
      </div>
    </div>
  </div>

  <div class="table-container">
    <div class="section-title" style="margin: 0 0 0 0;">ÍTEMS FIM</div>
    <table>
      <thead>
        <tr>
          <th class="center" style="width: 40px;">#</th>
          <th style="width: 180px;">Ítem</th>
          <th style="width: 140px;">Categoría</th>
          <th class="center" style="width: 80px;">Puntaje</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- Page 2 -->
  <div class="header">
    <div class="header-left">
      <h1>${tenantData.nombre}</h1>
      <p>
        CUIT: ${tenantData.cuit}<br>
        ${tenantData.direccion}<br>
        Tel: ${tenantData.telefono}<br>
        ${tenantData.email}
      </p>
    </div>
    <div class="header-right">
      <h2>FORMULARIO FIM</h2>
    </div>
  </div>

  <div class="evaluation-section">
    <h3>Evaluación institucional</h3>
    <p>${formData.evaluacion_institucional || 'Sin evaluación registrada.'}</p>
  </div>

  <div class="signature-section">
    <div class="signature-title">FIRMA DEL RESPONSABLE</div>
    <div class="signature-grid">
      <div class="signature-box">
        <div class="signature-name">${formData.firma_responsable_1 || 'Lic. Responsable 1'}</div>
        <div class="signature-line">Firma y aclaración</div>
      </div>
      <div class="signature-box">
        <div class="signature-name">${formData.firma_responsable_2 || 'Dr. Responsable 2'}</div>
        <div class="signature-line">Firma y aclaración</div>
      </div>
    </div>
  </div>

  <div class="footer">
    ${tenantData.nombre} — Formulario FIM — Página 2 de 2
  </div>
</body>
</html>
  `.trim();
}

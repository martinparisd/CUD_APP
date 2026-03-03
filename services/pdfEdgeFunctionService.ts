import { supabase } from '@/lib/supabase';
import { Platform, Alert } from 'react-native';

const TABLE_TO_FORM_TYPE: Record<string, string> = {
  formularios_fim: 'fim',
  evaluaciones_interdisciplinarias: 'evaluacion',
  anexo_iii_conformidad: 'anexo_iii',
  pedidos_medicos: 'pedido_medico',
  resumenes_historia_clinica: 'resumen_hc',
  informes_tratamiento: 'informe_tratamiento',
  formularios_plan_tratamiento: 'plan_tratamiento',
  presupuestos_prestaciones: 'presupuesto',
  fichas_prestador: 'ficha_prestador',
};

interface GeneratePDFParams {
  recordId: string;
  tableName: string;
  tenantId: string;
}

interface PDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfBase64?: string;
  error?: string;
}

export async function generatePDFViaEdgeFunction(
  params: GeneratePDFParams
): Promise<PDFResult> {
  try {
    const formType = TABLE_TO_FORM_TYPE[params.tableName];
    if (!formType) {
      return { success: false, error: `No form type mapping for table: ${params.tableName}` };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'No active session' };
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/generate-formulario-pdf`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey!,
      },
      body: JSON.stringify({
        record_id: params.recordId,
        form_type: formType,
        tenant_id: params.tenantId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      return { success: false, error: errorMsg };
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const blob = new Blob([bytes], { type: 'application/pdf' });

    return { success: true, pdfBlob: blob, pdfBase64: base64 };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error generating PDF via edge function',
    };
  }
}

export async function downloadPDFFromEdgeFunction(
  params: GeneratePDFParams,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await generatePDFViaEdgeFunction(params);

    if (!result.success || !result.pdfBlob) {
      return { success: false, error: result.error || 'No se pudo generar el PDF' };
    }

    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(result.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    }

    const FileSystem = await import('expo-file-system/next');
    const Sharing = await import('expo-sharing');

    const file = new FileSystem.File(FileSystem.Paths.document, `${fileName}.pdf`);
    const arrayBuffer = await result.pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    file.write(bytes);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Formulario',
      });
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al descargar PDF',
    };
  }
}

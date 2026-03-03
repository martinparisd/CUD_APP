import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

export interface DocuSignSigner {
  name: string;
  email: string;
}

export interface SendEnvelopeParams {
  pdfBase64: string;
  fileName: string;
  emailSubject: string;
  signers: DocuSignSigner[];
  tenantId: string;
  sourceTable: string;
  sourceRecordId: string;
}

export interface SendEnvelopeResult {
  success: boolean;
  envelopeId?: string;
  status?: string;
  error?: string;
}

export interface EnvelopeStatus {
  envelope_id: string;
  status: string;
  sent_at: string;
  completed_at?: string;
  file_name: string;
  signed_pdf_path?: string;
}

export interface DownloadSignedResult {
  success: boolean;
  status?: string;
  pdfBase64?: string;
  error?: string;
}

export async function sendEnvelopeForForm(params: SendEnvelopeParams): Promise<SendEnvelopeResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'No active session' };
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/docusign-send-envelope`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey!,
      },
      body: JSON.stringify({
        pdfBase64: params.pdfBase64,
        fileName: params.fileName,
        signers: params.signers,
        emailSubject: params.emailSubject,
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

    const result = await response.json();

    if (result.envelopeId) {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      await saveEnvelopeRecord({
        envelopeId: result.envelopeId,
        status: result.status || 'sent',
        sourceTable: params.sourceTable,
        sourceRecordId: params.sourceRecordId,
        tenantId: params.tenantId,
        fileName: params.fileName,
        emailSubject: params.emailSubject,
        signers: params.signers,
        sentBy: currentSession?.user?.id || '',
      });
    }

    return {
      success: true,
      envelopeId: result.envelopeId,
      status: result.status,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al enviar a DocuSign',
    };
  }
}

export async function downloadSignedPDF(envelopeId: string): Promise<DownloadSignedResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'No active session' };
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/docusign-download-signed`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey!,
      },
      body: JSON.stringify({ envelopeId }),
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

    const result = await response.json();
    return {
      success: true,
      status: result.status,
      pdfBase64: result.pdfBase64,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al descargar PDF firmado',
    };
  }
}

export async function downloadSignedPDFToDevice(
  pdfBase64: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (Platform.OS === 'web') {
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    }

    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');

    const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    const file = new FileSystem.File(FileSystem.Paths.document, safeName);
    file.write(bytes);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Documento Firmado',
      });
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al descargar PDF firmado',
    };
  }
}

async function saveEnvelopeRecord(params: {
  envelopeId: string;
  status: string;
  sourceTable: string;
  sourceRecordId: string;
  tenantId: string;
  fileName: string;
  emailSubject: string;
  signers: DocuSignSigner[];
  sentBy: string;
}) {
  await supabase.from('docusign_envelopes').upsert(
    {
      envelope_id: params.envelopeId,
      status: params.status,
      source_table: params.sourceTable,
      source_record_id: params.sourceRecordId,
      tenant_id: params.tenantId,
      file_name: params.fileName,
      email_subject: params.emailSubject,
      signers: params.signers,
      sent_by: params.sentBy,
      sent_at: new Date().toISOString(),
    },
    { onConflict: 'envelope_id' }
  );
}

export async function getEnvelopeForRecord(
  sourceTable: string,
  sourceRecordId: string
): Promise<EnvelopeStatus | null> {
  try {
    const { data, error } = await supabase
      .from('docusign_envelopes')
      .select('envelope_id, status, sent_at, completed_at, file_name, signed_pdf_path')
      .eq('source_table', sourceTable)
      .eq('source_record_id', sourceRecordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return data as EnvelopeStatus;
  } catch {
    return null;
  }
}

export async function saveSignedPDFToStorage(
  pdfBase64: string,
  envelopeId: string,
  fileName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    const storagePath = `${envelopeId}/${safeName}`;

    const { data, error } = await supabase.storage
      .from('signed-documents')
      .upload(storagePath, bytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase
      .from('docusign_envelopes')
      .update({
        signed_pdf_path: data.path,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('envelope_id', envelopeId);

    return { success: true, path: data.path };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al guardar PDF firmado',
    };
  }
}

export async function downloadSignedPDFFromStorage(
  storagePath: string
): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('signed-documents')
      .download(storagePath);

    if (error || !data) {
      return { success: false, error: error?.message || 'No se encontró el archivo' };
    }

    const arrayBuffer = await data.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return { success: true, pdfBase64: base64 };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al descargar PDF firmado',
    };
  }
}

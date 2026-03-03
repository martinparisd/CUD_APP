import { supabase } from '@/lib/supabase';

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
      await saveEnvelopeRecord({
        envelopeId: result.envelopeId,
        status: result.status || 'sent',
        sourceTable: params.sourceTable,
        sourceRecordId: params.sourceRecordId,
        tenantId: params.tenantId,
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

async function saveEnvelopeRecord(params: {
  envelopeId: string;
  status: string;
  sourceTable: string;
  sourceRecordId: string;
  tenantId: string;
}) {
  await supabase.from('docusign_envelopes').upsert(
    {
      envelope_id: params.envelopeId,
      status: params.status,
      source_table: params.sourceTable,
      source_record_id: params.sourceRecordId,
      tenant_id: params.tenantId,
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
      .select('envelope_id, status, sent_at, completed_at')
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

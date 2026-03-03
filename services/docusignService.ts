import { supabase } from '@/lib/supabase';

export interface DocuSignSigner {
  name: string;
  email: string;
}

export interface SendEnvelopeParams {
  pdfBase64: string;
  fileName: string;
  emailSubject: string;
  signer: DocuSignSigner;
  tenantId: string;
  sourceTable: string;
  sourceRecordId: string;
}

export interface SendEnvelopeResult {
  success: boolean;
  envelopeId?: string;
  error?: string;
}

export interface EnvelopeStatus {
  envelope_id: string;
  status: string;
  sent_at: string;
  completed_at?: string;
}

export async function sendEnvelopeForForm(params: SendEnvelopeParams): Promise<SendEnvelopeResult> {
  try {
    const { data, error } = await supabase.functions.invoke('docusign-send-envelope', {
      body: {
        pdf_base64: params.pdfBase64,
        file_name: params.fileName,
        email_subject: params.emailSubject,
        signers: [{ name: params.signer.name, email: params.signer.email }],
        tenant_id: params.tenantId,
        source_table: params.sourceTable,
        source_record_id: params.sourceRecordId,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      envelopeId: data?.envelope_id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al enviar a DocuSign',
    };
  }
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

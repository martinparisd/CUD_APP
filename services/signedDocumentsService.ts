import { supabase } from '@/lib/supabase';

export interface SignedDocument {
  id: string;
  envelope_id: string;
  file_name: string;
  signed_pdf_path: string;
  completed_at: string;
  email_subject: string;
  source_table: string;
  source_record_id: string;
}

export async function fetchUserSignedDocuments(): Promise<SignedDocument[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('docusign_envelopes')
      .select('id, envelope_id, file_name, signed_pdf_path, completed_at, email_subject, source_table, source_record_id')
      .eq('status', 'completed')
      .not('signed_pdf_path', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching signed documents:', error);
      return [];
    }

    return (data || []) as SignedDocument[];
  } catch (err) {
    console.error('Error in fetchUserSignedDocuments:', err);
    return [];
  }
}

export async function downloadSignedDocumentFromStorage(
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
      error: err instanceof Error ? err.message : 'Error al descargar el documento',
    };
  }
}

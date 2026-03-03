import { supabase } from '@/lib/supabase';
import { PDFTemplateData } from '@/types/pdfTemplates';
import { generateFIMPDF } from './pdfTemplates/fimTemplate';
import { TenantInfo, PacienteBasic } from './pdfTemplates/utils/pdfTypes';
import { Platform } from 'react-native';

type jsPDF = any;

const PDF_TEMPLATES: Record<string, (data: PDFTemplateData) => string> = {
  formularios_fim: generateFIMPDF,
  // Add more templates here as they are created
  // evaluaciones_interdisciplinarias: generateEvaluacionPDF,
  // etc.
};

type PDFRenderMode = 'html' | 'jspdf';

const USE_JSPDF_FOR_FORMS: Record<string, boolean> = {
  formularios_fim: true,
};

async function generateFormPDFWithJsPDF(
  formType: string,
  templateData: PDFTemplateData
): Promise<{ success: boolean; pdfDoc?: jsPDF; error?: string }> {
  try {
    // Dynamic import to avoid loading jsPDF on mobile platforms
    const { generateFimPDFWithJsPDF } = await import('./pdfTemplates/fimTemplatejsPDF');

    if (formType === 'formularios_fim') {
      const tenant: TenantInfo = {
        name: templateData.tenantData.nombre || '',
        cuit: templateData.tenantData.cuit || null,
        address: templateData.tenantData.direccion || null,
        city: null,
        province: null,
        phone: templateData.tenantData.telefono || null,
        email: templateData.tenantData.email || null,
        contact_name: null,
        contact_phone: null,
        contact_email: null,
        logo_url: templateData.tenantData.logo_url || null,
      };

      const paciente: PacienteBasic = {
        nombre: templateData.afiliadoData.nombre || null,
        apellido: templateData.afiliadoData.apellido || null,
        dni: templateData.afiliadoData.dni || '',
        obra_social: templateData.afiliadoData.obra_social || null,
      };

      const formData: any = templateData.formData;

      const pdfDoc = await generateFimPDFWithJsPDF(tenant, paciente, formData);

      return {
        success: true,
        pdfDoc,
      };
    }

    return {
      success: false,
      error: `No jsPDF template found for form type: ${formType}`,
    };
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    };
  }
}

export async function generateFormPDF(
  formType: string,
  templateData: PDFTemplateData,
  mode?: PDFRenderMode
): Promise<{ success: boolean; htmlContent?: string; pdfDoc?: jsPDF; error?: string }> {
  try {
    const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';
    const useJsPDF = !isNativeMobile && (mode === 'jspdf' || USE_JSPDF_FOR_FORMS[formType]);

    if (useJsPDF) {
      return await generateFormPDFWithJsPDF(formType, templateData);
    }

    const templateFunction = PDF_TEMPLATES[formType];

    if (!templateFunction) {
      return {
        success: false,
        error: `No PDF template found for form type: ${formType}`,
      };
    }

    const htmlContent = templateFunction(templateData);

    return {
      success: true,
      htmlContent,
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    };
  }
}

export async function savePDFToStorage(
  pdfDoc: jsPDF,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const pdfBlob = pdfDoc.output('blob');
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    const pdfUint8Array = new Uint8Array(pdfArrayBuffer);

    const { data, error } = await supabase.storage
      .from('form-pdfs')
      .upload(`${fileName}.pdf`, pdfUint8Array, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('form-pdfs')
      .getPublicUrl(`${fileName}.pdf`);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error saving PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save PDF',
    };
  }
}

export async function saveHTMLToStorage(
  html: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('form-pdfs')
      .upload(`${fileName}.html`, html, {
        contentType: 'text/html',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('form-pdfs')
      .getPublicUrl(`${fileName}.html`);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error saving HTML:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save HTML',
    };
  }
}

export async function downloadAndShareJsPDF(pdfDoc: jsPDF, fileName: string) {
  try {
    if (Platform.OS === 'web') {
      pdfDoc.save(`${fileName}.pdf`);
      return { success: true };
    } else {
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');

      const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.Paths.document}/${fileName}.pdf`;
      await FileSystem.File.create(fileUri, pdfBase64, {
        encoding: 'base64',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Formulario',
        });
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Error downloading/sharing PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download/share',
    };
  }
}

export async function downloadAndSharePDF(htmlContent: string, fileName: string) {
  try {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        printWindow.onload = () => {
          printWindow.print();
        };
      }
      return { success: true };
    } else {
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');

      const fileUri = `${FileSystem.Paths.document}/${fileName}.html`;
      await FileSystem.File.create(fileUri, htmlContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Compartir Formulario',
        });
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Error downloading/sharing PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download/share',
    };
  }
}

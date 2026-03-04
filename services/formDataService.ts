import { supabase } from '@/lib/supabase';
import { FormType, FormData } from '@/types/forms';

export async function fetchFormData(
  tableName: FormType,
  recordId: string
): Promise<FormData | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching form data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching form data:', error);
    return null;
  }
}

function calculateFIMTotal(items: any): number {
  if (!items || typeof items !== 'object') return 0;
  return Object.values(items).reduce((sum: number, itemData: any) => {
    // Handle both old format (just numbers) and new format (objects with score)
    const score = typeof itemData === 'number' ? itemData : (itemData?.score || 0);
    return sum + score;
  }, 0);
}

export async function createFormRecord(
  tableName: FormType,
  data: Partial<FormData>
): Promise<{ success: boolean; data?: FormData; error?: string }> {
  try {
    const dataToInsert: any = { ...data };

    if (tableName === 'formularios_fim' && (data as any).items) {
      dataToInsert.puntaje_total = calculateFIMTotal((data as any).items);
    }

    if (tableName === 'pedidos_medicos' && !dataToInsert.prestaciones_ambulatorias) {
      dataToInsert.prestaciones_ambulatorias = [];
    }

    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating form record:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: insertedData };
  } catch (error: any) {
    console.error('Error creating form record:', error);
    return { success: false, error: error.message };
  }
}

export async function updateFormRecord(
  tableName: FormType,
  recordId: string,
  data: Partial<FormData>
): Promise<{ success: boolean; data?: FormData; error?: string }> {
  try {
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (tableName === 'formularios_fim' && (data as any).items) {
      updateData.puntaje_total = calculateFIMTotal((data as any).items);
    }

    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error updating form record:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: updatedData };
  } catch (error: any) {
    console.error('Error updating form record:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFormRecord(
  tableName: FormType,
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('Error deleting form record:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting form record:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormRecords(
  tableName: FormType,
  afiliadoId: string
): Promise<FormData[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('afiliado_id', afiliadoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching form records:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching form records:', error);
    return [];
  }
}

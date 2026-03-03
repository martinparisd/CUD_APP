import { supabase } from '@/lib/supabase';

export interface FormRecord {
  id: string | null;
  afiliado_id: string;
  afiliado_nombre: string;
  afiliado_apellido: string;
  afiliado_dni: string;
  created_at: string;
  display_date?: string;
}

export interface AfiliadoDetails {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string | null;
  obra_social: string | null;
  estado_filiatorio_padron_sss: string | null;
  edad: number | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  tutor_nombre: string | null;
  tutor_apellido: string | null;
  direccion: string | null;
  localidad: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
}

export async function fetchFormRecords(
  tableName: string,
  searchQuery: string = '',
  tenantId: string | null = null
): Promise<FormRecord[]> {
  try {
    let afiliadosQuery = supabase
      .from('afiliados')
      .select('*')
      .order('apellido', { ascending: true })
      .order('nombre', { ascending: true });

    if (tenantId) {
      afiliadosQuery = afiliadosQuery.eq('tenant_id', tenantId);
    }

    const { data: afiliadosData, error: afiliadosError } = await afiliadosQuery;

    if (afiliadosError) {
      console.error('Error fetching afiliados:', afiliadosError);
      return [];
    }

    if (!afiliadosData) return [];

    let formsQuery = supabase
      .from(tableName)
      .select('id, afiliado_id, created_at, fecha');

    if (tenantId) {
      formsQuery = formsQuery.eq('tenant_id', tenantId);
    }

    const { data: formsData, error: formsError } = await formsQuery;

    if (formsError) {
      console.error('Error fetching forms:', formsError);
    }

    const formsMap = new Map();
    if (formsData) {
      formsData.forEach((form: any) => {
        formsMap.set(form.afiliado_id, form);
      });
    }

    const records: FormRecord[] = afiliadosData
      .map((afiliado: any) => {
        const formRecord = formsMap.get(afiliado.id);
        const displayDate = formRecord
          ? (formRecord.fecha_evaluacion ||
             formRecord.fecha ||
             formRecord.fecha_pedido ||
             formRecord.fecha_resumen ||
             formRecord.fecha_elaboracion ||
             formRecord.created_at)
          : afiliado.created_at;

        return {
          id: formRecord?.id || null,
          afiliado_id: afiliado.id,
          afiliado_nombre: afiliado.nombre || '',
          afiliado_apellido: afiliado.apellido || '',
          afiliado_dni: afiliado.dni || '',
          created_at: formRecord?.created_at || afiliado.created_at,
          display_date: displayDate,
        };
      })
      .filter((record) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${record.afiliado_nombre} ${record.afiliado_apellido}`.toLowerCase();
        const dni = record.afiliado_dni.toLowerCase();
        return fullName.includes(searchLower) || dni.includes(searchLower);
      });

    return records;
  } catch (error) {
    console.error('Error in fetchFormRecords:', error);
    return [];
  }
}

export async function fetchAfiliadoDetails(
  afiliadoId: string
): Promise<AfiliadoDetails | null> {
  try {
    const { data, error } = await supabase
      .from('afiliados')
      .select('*')
      .eq('id', afiliadoId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching afiliado details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchAfiliadoDetails:', error);
    return null;
  }
}

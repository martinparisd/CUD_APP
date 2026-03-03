import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  cellphone: string | null;
  department: string | null;
  dni: string | null;
  location: string | null;
  name: string | null;
  last_name: string | null;
  tenant_id: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in fetchUserProfile:', err);
    return null;
  }
}

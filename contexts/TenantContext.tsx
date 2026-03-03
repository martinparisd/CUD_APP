import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Tenant {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
}

interface TenantContextType {
  selectedTenantId: string | null;
  currentTenantId: string | null;
  setSelectedTenantId: (id: string | null) => void;
  tenants: Tenant[];
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('[TenantContext] useEffect triggered', { userId: user?.id });
    if (user) {
      loadTenants();
    } else {
      setTenants([]);
      setSelectedTenantId(null);
      setLoading(false);
    }
  }, [user]);

  const loadTenants = async () => {
    console.log('[TenantContext] loadTenants called', { userId: user?.id });

    if (!user) {
      console.log('[TenantContext] No user, returning early');
      setLoading(false);
      return;
    }

    try {
      console.log('[TenantContext] Fetching user_roles...');
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id);

      console.log('[TenantContext] user_roles result:', { count: userRoles?.length, error: rolesError });

      if (rolesError) throw rolesError;

      const tenantIds = userRoles?.map(role => role.tenant_id) || [];

      if (tenantIds.length === 0) {
        console.log('[TenantContext] No tenant IDs found for user');
        setTenants([]);
        setSelectedTenantId(null);
        setLoading(false);
        return;
      }

      console.log('[TenantContext] Fetching tenants for IDs:', tenantIds);
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, logo_url, is_active')
        .eq('is_active', true)
        .in('id', tenantIds)
        .order('name');

      console.log('[TenantContext] tenants result:', { count: data?.length, error });

      if (error) throw error;

      setTenants(data || []);

      if (data && data.length > 0 && !selectedTenantId) {
        console.log('[TenantContext] Setting selectedTenantId to:', data[0].id);
        setSelectedTenantId(data[0].id);
      }
    } catch (error) {
      console.error('[TenantContext] Error loading tenants:', error);
    } finally {
      setLoading(false);
      console.log('[TenantContext] loadTenants finished');
    }
  };

  return (
    <TenantContext.Provider
      value={{
        selectedTenantId,
        currentTenantId: selectedTenantId,
        setSelectedTenantId,
        tenants,
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

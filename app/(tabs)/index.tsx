import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Building2, Check } from 'lucide-react-native';

export default function HomeTab() {
  const { selectedTenantId, setSelectedTenantId, tenants, loading } = useTenant();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUserName(data.name || 'Usuario');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserName('Usuario');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B4CDB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenido, {userName}! 👋</Text>
        </View>

        {tenants.length === 0 ? (
          <View style={styles.noTenantsCard}>
            <Building2 size={48} color="#9CA3AF" />
            <Text style={styles.noTenantsTitle}>Sin Entidades Asignadas</Text>
            <Text style={styles.noTenantsText}>
              No tienes ninguna entidad asignada a tu cuenta. Por favor, contacta al administrador para obtener acceso.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Building2 size={24} color="#5B4CDB" />
              <Text style={styles.cardTitle}>Seleccionar Entidad</Text>
            </View>

            <Text style={styles.label}>Entidades Disponibles</Text>

            <View style={styles.tenantsContainer}>
              {tenants.map((tenant) => (
                <TouchableOpacity
                  key={tenant.id}
                  style={[
                    styles.tenantCard,
                    selectedTenantId === tenant.id && styles.tenantCardSelected
                  ]}
                  onPress={() => setSelectedTenantId(tenant.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tenantCardContent}>
                    {tenant.logo_url && (
                      <Image
                        source={{ uri: tenant.logo_url }}
                        style={styles.tenantCardLogo}
                        resizeMode="contain"
                      />
                    )}
                    <View style={styles.tenantCardInfo}>
                      <Text style={[
                        styles.tenantCardName,
                        selectedTenantId === tenant.id && styles.tenantCardNameSelected
                      ]}>
                        {tenant.name}
                      </Text>
                      {selectedTenantId === tenant.id && (
                        <Text style={styles.tenantCardStatus}>Activa</Text>
                      )}
                    </View>
                  </View>
                  {selectedTenantId === tenant.id && (
                    <View style={styles.checkmarkContainer}>
                      <Check size={20} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>Novedades</Text>
          <Text style={styles.newsText}>
            Las noticias del Boletín Oficial y la Superintendencia de Servicios de Salud serán periódicamente actualizadas y mostradas en Novedades.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información</Text>
          <Text style={styles.infoText}>
            Todos los formularios y afiliados mostrados en la aplicación están filtrados por la entidad seleccionada.
          </Text>
          <Text style={styles.infoNote}>
            Nota: No se permiten actualizaciones en la base de datos desde esta aplicación.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  noTenantsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noTenantsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noTenantsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tenantsContainer: {
    gap: 12,
  },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tenantCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B4CDB',
  },
  tenantCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantCardLogo: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
  },
  tenantCardInfo: {
    flex: 1,
  },
  tenantCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tenantCardNameSelected: {
    color: '#5B4CDB',
  },
  tenantCardStatus: {
    fontSize: 12,
    color: '#5B4CDB',
    marginTop: 2,
    fontWeight: '500',
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5B4CDB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  newsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  newsText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3730A3',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4C1D95',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoNote: {
    fontSize: 12,
    color: '#6D28D9',
    fontStyle: 'italic',
  },
});

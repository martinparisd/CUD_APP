import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react-native';
import { FormRecord, AfiliadoDetails, fetchAfiliadoDetails } from '@/services/formRecordsService';
import { useState } from 'react';
import { useRouter } from 'expo-router';

interface FormRecordListProps {
  records: FormRecord[];
  loading: boolean;
  onRecordPress: (record: FormRecord) => void;
  formRouteName: string;
  formDisplayName: string;
}

export default function FormRecordList({ records, loading, onRecordPress, formRouteName, formDisplayName }: FormRecordListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [afiliadoDetails, setAfiliadoDetails] = useState<AfiliadoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B4CDB" />
        <Text style={styles.loadingText}>Cargando registros...</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FileText size={48} color="#D1D5DB" strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No hay registros</Text>
        <Text style={styles.emptySubtitle}>
          Presiona el botón + para crear un nuevo registro
        </Text>
      </View>
    );
  }

  const handleCardPress = async (item: FormRecord) => {
    if (expandedId === item.afiliado_id) {
      setExpandedId(null);
      setAfiliadoDetails(null);
    } else {
      setExpandedId(item.afiliado_id);
      setLoadingDetails(true);
      const details = await fetchAfiliadoDetails(item.afiliado_id);
      setAfiliadoDetails(details);
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const renderDetailRow = (label: string, value: string | number | null) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const renderRecord = ({ item }: { item: FormRecord }) => {
    const isExpanded = expandedId === item.afiliado_id;

    return (
      <View style={styles.recordWrapper}>
        <TouchableOpacity
          style={styles.recordCard}
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}>
          <View style={styles.recordIcon}>
            <FileText size={24} color="#5B4CDB" strokeWidth={2} />
          </View>
          <View style={styles.recordContent}>
            <Text style={styles.recordName}>
              {item.afiliado_apellido}, {item.afiliado_nombre}
            </Text>
            <Text style={styles.recordDni}>DNI: {item.afiliado_dni}</Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
          ) : (
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {loadingDetails ? (
              <View style={styles.detailsLoading}>
                <ActivityIndicator size="small" color="#5B4CDB" />
                <Text style={styles.loadingDetailsText}>Cargando detalles...</Text>
              </View>
            ) : afiliadoDetails ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Datos Personales</Text>
                {renderDetailRow('Nombre completo', `${afiliadoDetails.nombre} ${afiliadoDetails.apellido}`)}
                {renderDetailRow('DNI', afiliadoDetails.dni)}
                {renderDetailRow('CUIL', afiliadoDetails.cuil)}
                {renderDetailRow('Edad', afiliadoDetails.edad)}
                {renderDetailRow('Sexo', afiliadoDetails.sexo)}
                {renderDetailRow('Fecha de nacimiento', formatDate(afiliadoDetails.fecha_nacimiento))}

                {(afiliadoDetails.tutor_nombre || afiliadoDetails.tutor_apellido) && (
                  <>
                    <Text style={styles.sectionTitle}>Tutor</Text>
                    {renderDetailRow('Nombre tutor', `${afiliadoDetails.tutor_nombre || ''} ${afiliadoDetails.tutor_apellido || ''}`.trim())}
                  </>
                )}

                <Text style={styles.sectionTitle}>Obra Social</Text>
                {renderDetailRow('Obra social', afiliadoDetails.obra_social)}
                {renderDetailRow('Estado filiatorio', afiliadoDetails.estado_filiatorio_padron_sss)}

                <Text style={styles.sectionTitle}>Contacto</Text>
                {renderDetailRow('Dirección', afiliadoDetails.direccion)}
                {renderDetailRow('Localidad', afiliadoDetails.localidad)}
                {renderDetailRow('Provincia', afiliadoDetails.provincia)}
                {renderDetailRow('Teléfono', afiliadoDetails.telefono)}
                {renderDetailRow('Email', afiliadoDetails.email)}

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/formularios/historial',
                      params: {
                        afiliadoId: item.afiliado_id,
                        formRouteName: formRouteName,
                      },
                    });
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.editButtonText}>Ver formulario</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.errorText}>No se pudieron cargar los detalles</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={records}
      renderItem={renderRecord}
      keyExtractor={(item) => item.afiliado_id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  recordWrapper: {
    marginBottom: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  recordDni: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  expandedContent: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: -12,
  },
  detailsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B4CDB',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    width: 140,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#5B4CDB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
});

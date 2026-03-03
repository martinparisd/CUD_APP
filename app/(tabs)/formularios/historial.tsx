import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useState, useEffect } from 'react';
import { FileText, ChevronRight, Plus, FileCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { AfiliadoDetails, fetchAfiliadoDetails } from '@/services/formRecordsService';
import { fetchUserSignedDocuments, SignedDocument, downloadSignedDocumentFromStorage } from '@/services/signedDocumentsService';
import { downloadSignedPDFToDevice } from '@/services/docusignService';

interface HistorialRecord {
  id: string;
  form_type: string;
  form_display_name: string;
  form_route_name: string;
  created_at: string;
  updated_at: string;
}

export default function Historial() {
  const { afiliadoId, formRouteName } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [afiliadoDetails, setAfiliadoDetails] = useState<AfiliadoDetails | null>(null);
  const [records, setRecords] = useState<HistorialRecord[]>([]);
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [afiliadoId, formRouteName]);

  useEffect(() => {
    const formTables = [
      { tableName: 'evaluaciones_interdisciplinarias', displayName: 'Evaluación Interdisciplinaria', routeName: 'evaluacion-interdisciplinaria' },
      { tableName: 'formularios_fim', displayName: 'Formulario FIM', routeName: 'formulario-fim' },
      { tableName: 'pedidos_medicos', displayName: 'Pedido Médico', routeName: 'formulario-pedido-medico' },
      { tableName: 'resumenes_historia_clinica', displayName: 'Resumen Historia Clínica', routeName: 'resumen-historia-clinica' },
      { tableName: 'informes_tratamiento', displayName: 'RE158 - Informe', routeName: 're158-informe' },
      { tableName: 'formularios_plan_tratamiento', displayName: 'RE159 - Plan de Tratamiento', routeName: 're159-plan-tratamiento' },
      { tableName: 'presupuestos_prestaciones', displayName: 'RE160 - Presupuesto', routeName: 're160-presupuesto' },
      { tableName: 'fichas_prestador', displayName: 'RE161 - Ficha Prestador', routeName: 're161-ficha-prestador' },
      { tableName: 'anexo_iii_conformidad', displayName: 'Anexo III - Conformidad', routeName: 'anexo-conformidad' },
    ];

    if (formRouteName && typeof formRouteName === 'string') {
      const formConfig = formTables.find(form => form.routeName === formRouteName);
      if (formConfig) {
        navigation.setOptions({
          title: `Historial - ${formConfig.displayName}`,
        });
      }
    } else {
      navigation.setOptions({
        title: 'Mis documentos',
      });
    }
  }, [formRouteName, navigation]);

  const loadData = async () => {
    setLoading(true);

    if (!afiliadoId && !formRouteName) {
      const signedDocs = await fetchUserSignedDocuments();
      setSignedDocuments(signedDocs);
      setLoading(false);
      return;
    }

    if (!afiliadoId || typeof afiliadoId !== 'string') {
      setLoading(false);
      return;
    }

    const details = await fetchAfiliadoDetails(afiliadoId);
    setAfiliadoDetails(details);

    const allRecords: HistorialRecord[] = [];

    const formTables = [
      { tableName: 'evaluaciones_interdisciplinarias', displayName: 'Evaluación Interdisciplinaria', routeName: 'evaluacion-interdisciplinaria' },
      { tableName: 'formularios_fim', displayName: 'Formulario FIM', routeName: 'formulario-fim' },
      { tableName: 'pedidos_medicos', displayName: 'Pedido Médico', routeName: 'formulario-pedido-medico' },
      { tableName: 'resumenes_historia_clinica', displayName: 'Resumen Historia Clínica', routeName: 'resumen-historia-clinica' },
      { tableName: 'informes_tratamiento', displayName: 'RE158 - Informe', routeName: 're158-informe' },
      { tableName: 'formularios_plan_tratamiento', displayName: 'RE159 - Plan de Tratamiento', routeName: 're159-plan-tratamiento' },
      { tableName: 'presupuestos_prestaciones', displayName: 'RE160 - Presupuesto', routeName: 're160-presupuesto' },
      { tableName: 'fichas_prestador', displayName: 'RE161 - Ficha Prestador', routeName: 're161-ficha-prestador' },
      { tableName: 'anexo_iii_conformidad', displayName: 'Anexo III - Conformidad', routeName: 'anexo-conformidad' },
    ];

    const formsToQuery = formRouteName && typeof formRouteName === 'string'
      ? formTables.filter(form => form.routeName === formRouteName)
      : formTables;

    for (const form of formsToQuery) {
      try {
        const { data, error } = await supabase
          .from(form.tableName)
          .select('id, created_at, updated_at')
          .eq('afiliado_id', afiliadoId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          data.forEach((record) => {
            allRecords.push({
              id: record.id,
              form_type: form.tableName,
              form_display_name: form.displayName,
              form_route_name: form.routeName,
              created_at: record.created_at,
              updated_at: record.updated_at,
            });
          });
        }
      } catch (err) {
        console.error(`Error fetching ${form.tableName}:`, err);
      }
    }

    allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecords(allRecords);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleRecordPress = (record: HistorialRecord) => {
    router.push({
      pathname: `/(tabs)/formularios/${record.id}`,
      params: {
        formRouteName: record.form_route_name,
        afiliadoId: afiliadoId,
        formDisplayName: record.form_display_name,
      },
    });
  };

  const handleSignedDocumentPress = async (doc: SignedDocument) => {
    setDownloadingDoc(doc.id);
    try {
      const result = await downloadSignedDocumentFromStorage(doc.signed_pdf_path);
      if (result.success && result.pdfBase64) {
        await downloadSignedPDFToDevice(result.pdfBase64, doc.file_name);
      }
    } catch (err) {
      console.error('Error downloading signed document:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleCreateNew = () => {
    if (!formRouteName || typeof formRouteName !== 'string' || !afiliadoId) return;

    const formTables = [
      { tableName: 'evaluaciones_interdisciplinarias', displayName: 'Evaluación Interdisciplinaria', routeName: 'evaluacion-interdisciplinaria' },
      { tableName: 'formularios_fim', displayName: 'Formulario FIM', routeName: 'formulario-fim' },
      { tableName: 'pedidos_medicos', displayName: 'Pedido Médico', routeName: 'formulario-pedido-medico' },
      { tableName: 'resumenes_historia_clinica', displayName: 'Resumen Historia Clínica', routeName: 'resumen-historia-clinica' },
      { tableName: 'informes_tratamiento', displayName: 'RE158 - Informe', routeName: 're158-informe' },
      { tableName: 'formularios_plan_tratamiento', displayName: 'RE159 - Plan de Tratamiento', routeName: 're159-plan-tratamiento' },
      { tableName: 'presupuestos_prestaciones', displayName: 'RE160 - Presupuesto', routeName: 're160-presupuesto' },
      { tableName: 'fichas_prestador', displayName: 'RE161 - Ficha Prestador', routeName: 're161-ficha-prestador' },
      { tableName: 'anexo_iii_conformidad', displayName: 'Anexo III - Conformidad', routeName: 'anexo-conformidad' },
    ];

    const formConfig = formTables.find(form => form.routeName === formRouteName);
    if (!formConfig) return;

    router.push({
      pathname: `/(tabs)/formularios/new`,
      params: {
        formRouteName: formRouteName,
        afiliadoId: afiliadoId,
        formDisplayName: formConfig.displayName,
      },
    });
  };

  const renderRecord = ({ item }: { item: HistorialRecord }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.7}>
      <View style={styles.recordIcon}>
        <FileText size={24} color="#5B4CDB" strokeWidth={2} />
      </View>
      <View style={styles.recordContent}>
        <Text style={styles.recordTitle}>{item.form_display_name}</Text>
        <Text style={styles.recordDate}>Creado: {formatDate(item.created_at)}</Text>
        {item.updated_at !== item.created_at && (
          <Text style={styles.recordDateUpdate}>Actualizado: {formatDate(item.updated_at)}</Text>
        )}
      </View>
      <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  );

  const renderSignedDocument = ({ item }: { item: SignedDocument }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => handleSignedDocumentPress(item)}
      activeOpacity={0.7}
      disabled={downloadingDoc === item.id}>
      <View style={[styles.recordIcon, styles.signedIcon]}>
        {downloadingDoc === item.id ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <FileCheck size={24} color="#10B981" strokeWidth={2} />
        )}
      </View>
      <View style={styles.recordContent}>
        <Text style={styles.recordTitle}>{item.email_subject || item.file_name}</Text>
        <Text style={styles.recordDate}>Firmado: {formatDate(item.completed_at)}</Text>
        <Text style={styles.signedBadge}>Documento firmado</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5B4CDB" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {afiliadoDetails && (
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {afiliadoDetails.apellido}, {afiliadoDetails.nombre}
              </Text>
              <Text style={styles.headerSubtitle}>DNI: {afiliadoDetails.dni}</Text>
            </View>
            {formRouteName && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNew}
                activeOpacity={0.8}>
                <Plus size={20} color="#5B4CDB" strokeWidth={2.5} />
                <Text style={styles.createButtonText}>Crear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!afiliadoId && !formRouteName ? (
        signedDocuments.length === 0 ? (
          <View style={styles.centerContainer}>
            <FileCheck size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No hay documentos firmados</Text>
            <Text style={styles.emptySubtitle}>
              Los documentos que firmes aparecerán aquí
            </Text>
          </View>
        ) : (
          <FlatList
            data={signedDocuments}
            renderItem={renderSignedDocument}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : records.length === 0 ? (
        <View style={styles.centerContainer}>
          <FileText size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No hay formularios</Text>
          <Text style={styles.emptySubtitle}>
            Este afiliado no tiene formularios registrados aún
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => `${item.form_type}-${item.id}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerSection: {
    backgroundColor: '#5B4CDB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5B4CDB',
  },
  listContainer: {
    padding: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  signedIcon: {
    backgroundColor: '#D1FAE5',
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  recordDateUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  signedBadge: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
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
});

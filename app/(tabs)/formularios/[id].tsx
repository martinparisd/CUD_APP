import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { fetchAfiliadoDetails, AfiliadoDetails } from '@/services/formRecordsService';
import { getFormTableConfig } from '@/config/formTables';
import { formConfigs } from '@/config/formConfigs';
import { fetchFormData, createFormRecord, updateFormRecord } from '@/services/formDataService';
import { FormType } from '@/types/forms';
import DynamicForm from '@/components/DynamicForm';
import { useFormState } from '@/hooks/useFormState';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { generatePDFViaEdgeFunction, downloadPDFFromEdgeFunction } from '@/services/pdfEdgeFunctionService';
import { sendEnvelopeForForm, getEnvelopeForRecord, downloadSignedPDF, downloadSignedPDFToDevice, downloadSignedPDFFromStorage, EnvelopeStatus } from '@/services/docusignService';
import { Share2, Send, CircleCheck as CheckCircle, Download } from 'lucide-react-native';

export default function AfiliadoDetail() {
  const { id, afiliadoId, formDisplayName, formRouteName } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { selectedTenantId, tenants } = useTenant();
  const { user } = useAuth();
  const [afiliadoDetails, setAfiliadoDetails] = useState<AfiliadoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [envelopeStatus, setEnvelopeStatus] = useState<EnvelopeStatus | null>(null);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  const recordId = id;

  console.log('=== AfiliadoDetail Debug ===');
  console.log('URL params:', { id, afiliadoId, formDisplayName, formRouteName, recordId });

  const formConfig = formRouteName && typeof formRouteName === 'string' ? getFormTableConfig(formRouteName) : undefined;
  console.log('formConfig lookup for formRouteName:', formRouteName, '→', formConfig);

  const dynamicFormConfig = formConfig ? formConfigs[formConfig.tableName] : undefined;
  console.log('dynamicFormConfig lookup for tableName:', formConfig?.tableName, '→', dynamicFormConfig ? 'FOUND' : 'NOT FOUND');
  console.log('=========================');

  const { data, errors, isDirty, handleChange, validate, setData } = useFormState({
    initialData: {},
    config: dynamicFormConfig || { tableName: '', sections: [] },
  });

  useEffect(() => {
    loadAfiliadoDetails();
    if (recordId && typeof recordId === 'string' && recordId !== 'new' && formConfig) {
      loadFormData();
      loadEnvelopeStatus(formConfig.tableName, recordId);
    } else if (afiliadoId && typeof afiliadoId === 'string') {
      setData({ afiliado_id: afiliadoId, fecha: new Date().toISOString().split('T')[0] });
      setLoading(false);
    }
  }, [afiliadoId, recordId]);

  const loadEnvelopeStatus = async (sourceTable: string, sourceRecordId: string) => {
    const status = await getEnvelopeForRecord(sourceTable, sourceRecordId);
    setEnvelopeStatus(status);

    if (status && status.status === 'completed' && !status.signed_pdf_path) {
      const result = await downloadSignedPDF(status.envelope_id);
      if (result.success && result.signedPdfPath) {
        setEnvelopeStatus(prev => prev ? { ...prev, signed_pdf_path: result.signedPdfPath } : prev);
      }
    }
  };

  const loadAfiliadoDetails = async () => {
    if (!afiliadoId || typeof afiliadoId !== 'string') {
      setLoading(false);
      return;
    }

    const details = await fetchAfiliadoDetails(afiliadoId);
    setAfiliadoDetails(details);
    setLoading(false);
  };

  const loadFormData = async () => {
    if (!recordId || typeof recordId !== 'string' || !formConfig) return;

    setLoading(true);
    const formData = await fetchFormData(formConfig.tableName as FormType, recordId);
    if (formData) {
      setData(formData as Record<string, any>);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (!formConfig || !afiliadoId || typeof afiliadoId !== 'string') return;

    setSaving(true);

    const formData = {
      ...data,
      afiliado_id: afiliadoId,
    };

    let result;
    if (recordId && typeof recordId === 'string' && recordId !== 'new') {
      result = await updateFormRecord(formConfig.tableName as FormType, recordId, formData);
    } else {
      result = await createFormRecord(formConfig.tableName as FormType, formData);
    }

    if (result.success && afiliadoDetails && selectedTenantId) {
      const savedRecordId = result.data?.id || recordId;
      if (savedRecordId && typeof savedRecordId === 'string' && savedRecordId !== 'new') {
        const fileName = `${formConfig.displayName}_${afiliadoDetails.apellido}_${afiliadoDetails.nombre}_${Date.now()}`;
        Alert.alert(
          'Formulario guardado',
          '¿Desea descargar el PDF del formulario?',
          [
            {
              text: 'Más tarde',
              onPress: () => router.back(),
              style: 'cancel',
            },
            {
              text: 'Descargar',
              onPress: async () => {
                const pdfResult = await downloadPDFFromEdgeFunction(
                  { recordId: savedRecordId, tableName: formConfig.tableName, tenantId: selectedTenantId },
                  fileName
                );
                if (!pdfResult.success) {
                  Alert.alert('Error', pdfResult.error || 'No se pudo descargar el PDF');
                }
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Éxito', 'Formulario guardado correctamente', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } else if (result.success) {
      Alert.alert('Éxito', 'Formulario guardado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar el formulario');
    }

    setSaving(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Cambios sin guardar',
        '¿Está seguro que desea salir sin guardar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!formConfig || !afiliadoDetails || !selectedTenantId) {
      Alert.alert('Error', 'Faltan datos necesarios para generar el PDF');
      return;
    }

    if (!recordId || typeof recordId !== 'string' || recordId === 'new') {
      Alert.alert('Error', 'Debe guardar el formulario antes de descargar el PDF');
      return;
    }

    try {
      const fileName = `${formConfig.displayName}_${afiliadoDetails.apellido}_${afiliadoDetails.nombre}_${Date.now()}`;
      const result = await downloadPDFFromEdgeFunction(
        { recordId, tableName: formConfig.tableName, tenantId: selectedTenantId },
        fileName
      );

      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo generar el PDF');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al generar el PDF');
    }
  }, [formConfig, afiliadoDetails, selectedTenantId, recordId]);

  const handleSend = useCallback(async () => {
    if (!formConfig || !afiliadoDetails || !selectedTenantId) {
      Alert.alert('Error', 'Faltan datos necesarios para enviar a DocuSign');
      return;
    }

    if (!user?.email) {
      Alert.alert('Error', 'No se pudo obtener el email del usuario autenticado');
      return;
    }

    if (!recordId || typeof recordId !== 'string' || recordId === 'new') {
      Alert.alert('Error', 'Debe guardar el formulario antes de enviarlo a DocuSign');
      return;
    }

    const signerName = user.user_metadata?.full_name || user.email;
    const signerEmail = user.email;
    const signerDisplay = signerName !== signerEmail ? `${signerName} (${signerEmail})` : signerEmail;

    Alert.alert(
      'Enviar a DocuSign',
      `Se enviará el formulario de ${afiliadoDetails.apellido}, ${afiliadoDetails.nombre} para firma a:\n\n${signerDisplay}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setSending(true);

            try {
              const pdfResult = await generatePDFViaEdgeFunction({
                recordId,
                tableName: formConfig.tableName,
                tenantId: selectedTenantId,
              });

              if (!pdfResult.success || !pdfResult.pdfBase64) {
                throw new Error(pdfResult.error || 'No se pudo generar el PDF');
              }

              const fileName = `${formConfig.displayName}_${afiliadoDetails.apellido}_${afiliadoDetails.nombre}_${Date.now()}.pdf`;

              const result = await sendEnvelopeForForm({
                pdfBase64: pdfResult.pdfBase64,
                fileName,
                emailSubject: `Firmar: ${formConfig.displayName} - ${afiliadoDetails.apellido}, ${afiliadoDetails.nombre}`,
                signers: [{ name: signerName, email: signerEmail }],
                tenantId: selectedTenantId,
                sourceTable: formConfig.tableName,
                sourceRecordId: recordId,
              });

              if (result.success) {
                await loadEnvelopeStatus(formConfig.tableName, recordId);
                Alert.alert(
                  'Enviado correctamente',
                  `El formulario fue enviado a DocuSign exitosamente.\n\nID de sobre: ${result.envelopeId}`
                );
              } else {
                throw new Error(result.error || 'Error al enviar a DocuSign');
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Ocurrió un error al enviar a DocuSign');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  }, [formConfig, afiliadoDetails, selectedTenantId, user, recordId]);

  const handleCheckSignedDocument = useCallback(async () => {
    if (!envelopeStatus) return;

    setDownloading(true);
    try {
      const fileName = envelopeStatus.file_name
        ? `firmado_${envelopeStatus.file_name}`
        : `documento_firmado_${Date.now()}.pdf`;

      if (envelopeStatus.signed_pdf_path) {
        const storageResult = await downloadSignedPDFFromStorage(envelopeStatus.signed_pdf_path);
        if (storageResult.success && storageResult.pdfBase64) {
          await downloadSignedPDFToDevice(storageResult.pdfBase64, fileName);
          return;
        }
      }

      const result = await downloadSignedPDF(envelopeStatus.envelope_id);

      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo verificar el documento');
        return;
      }

      if (result.status === 'completed' && result.pdfBase64) {
        const downloadResult = await downloadSignedPDFToDevice(result.pdfBase64, fileName);

        if (!downloadResult.success) {
          Alert.alert('Error', downloadResult.error || 'No se pudo descargar el documento firmado');
          return;
        }

        setEnvelopeStatus(prev => prev ? {
          ...prev,
          status: 'completed',
          signed_pdf_path: result.signedPdfPath || prev.signed_pdf_path,
        } : prev);
      } else {
        Alert.alert('Pendiente', 'El documento aun no fue firmado.');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al verificar documento firmado');
    } finally {
      setDownloading(false);
    }
  }, [envelopeStatus]);

  useEffect(() => {
    if (afiliadoDetails) {
      navigation.setOptions({
        title: `${afiliadoDetails.apellido}, ${afiliadoDetails.nombre}`,
        headerRight: () => (
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={handleDownloadPDF}
              style={styles.headerIconButton}
            >
              <Share2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={envelopeStatus ? handleCheckSignedDocument : handleSend}
              style={[styles.headerIconButton, (sending || downloading) && styles.headerIconDisabled]}
              disabled={sending || downloading}
            >
              {sending || downloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : envelopeStatus?.status === 'completed' ? (
                <Download size={24} color="#34D399" />
              ) : envelopeStatus ? (
                <CheckCircle size={24} color="#FBBF24" />
              ) : (
                <Send size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [afiliadoDetails, navigation, sending, downloading, envelopeStatus, handleSend, handleCheckSignedDocument, handleDownloadPDF]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5B4CDB" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (!afiliadoDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No se pudieron cargar los detalles del afiliado</Text>
        </View>
      </View>
    );
  }

  if (!dynamicFormConfig) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Configuración de formulario no encontrada</Text>
        </View>
      </View>
    );
  }

  const decodedFormName = formDisplayName && typeof formDisplayName === 'string'
    ? decodeURIComponent(formDisplayName)
    : '';

  return (
    <View style={styles.container}>
      {decodedFormName && (
        <View style={styles.formHeader}>
          <Text style={styles.formHeaderText}>{decodedFormName}</Text>
        </View>
      )}
      <DynamicForm
        config={dynamicFormConfig}
        data={data}
        onChange={handleChange}
        errors={errors}
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
        recordId={recordId && typeof recordId === 'string' && recordId !== 'new' ? recordId : undefined}
        tableName={formConfig?.tableName || ''}
        tenantId={selectedTenantId}
      />
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
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  formHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  contentText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerIconDisabled: {
    opacity: 0.5,
  },
});

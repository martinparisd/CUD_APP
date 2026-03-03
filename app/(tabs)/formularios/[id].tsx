import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchAfiliadoDetails, AfiliadoDetails } from '@/services/formRecordsService';
import { getFormTableConfig } from '@/config/formTables';
import { formConfigs } from '@/config/formConfigs';
import { fetchFormData, createFormRecord, updateFormRecord } from '@/services/formDataService';
import { FormType } from '@/types/forms';
import DynamicForm from '@/components/DynamicForm';
import { useFormState } from '@/hooks/useFormState';
import { useTenant } from '@/contexts/TenantContext';
import { generateFormPDF, saveHTMLToStorage, downloadAndSharePDF, savePDFToStorage, downloadAndShareJsPDF } from '@/services/pdfGenerationService';
import { supabase } from '@/lib/supabase';
import { FileDown, Send } from 'lucide-react-native';

export default function AfiliadoDetail() {
  const { id, afiliadoId, formDisplayName, formRouteName } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { selectedTenantId, tenants } = useTenant();
  const [afiliadoDetails, setAfiliadoDetails] = useState<AfiliadoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } else if (afiliadoId && typeof afiliadoId === 'string') {
      setData({ afiliado_id: afiliadoId, fecha: new Date().toISOString().split('T')[0] });
      setLoading(false);
    }
  }, [afiliadoId, recordId]);

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
              <FileDown size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              style={styles.headerIconButton}
            >
              <Send size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [afiliadoDetails, navigation, data]);

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

    // Generate PDF for FIM forms
    if (result.success && formConfig.tableName === 'formularios_fim' && afiliadoDetails && selectedTenantId) {
      try {
        // Fetch full tenant details
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', selectedTenantId)
          .single();

        if (tenantError || !tenantData) {
          throw new Error('No se pudo obtener información del tenant');
        }

        const pdfResult = await generateFormPDF(formConfig.tableName, {
          formType: formConfig.tableName,
          formData: formData,
          afiliadoData: {
            nombre: afiliadoDetails.nombre,
            apellido: afiliadoDetails.apellido,
            dni: afiliadoDetails.dni,
            obra_social: afiliadoDetails.obra_social || undefined,
          },
          tenantData: {
            nombre: tenantData.nombre || '',
            cuit: tenantData.cuit || '',
            direccion: tenantData.direccion || '',
            telefono: tenantData.telefono || '',
            email: tenantData.email || '',
            logo_url: tenantData.logo_url || null,
          },
        });

        if (pdfResult.success) {
          const fileName = `FIM_${afiliadoDetails.apellido}_${afiliadoDetails.nombre}_${new Date().getTime()}`;

          if (pdfResult.pdfDoc) {
            await savePDFToStorage(pdfResult.pdfDoc, fileName);

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
                    await downloadAndShareJsPDF(pdfResult.pdfDoc!, fileName);
                    router.back();
                  },
                },
              ]
            );
          } else if (pdfResult.htmlContent) {
            await saveHTMLToStorage(pdfResult.htmlContent, fileName);

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
                    await downloadAndSharePDF(pdfResult.htmlContent!, fileName);
                    router.back();
                  },
                },
              ]
            );
          } else {
            Alert.alert('Éxito', 'Formulario guardado correctamente', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          }
        } else {
          Alert.alert('Éxito', 'Formulario guardado correctamente', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        Alert.alert('Éxito', 'Formulario guardado correctamente (PDF no disponible)', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } else if (result.success) {
      Alert.alert('Éxito', 'Formulario guardado correctamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
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

  const handleDownloadPDF = async () => {
    if (!formConfig || !afiliadoDetails || !selectedTenantId) {
      Alert.alert('Error', 'Faltan datos necesarios para generar el PDF');
      return;
    }

    if (formConfig.tableName !== 'formularios_fim') {
      Alert.alert('Información', 'La generación de PDF solo está disponible para formularios FIM');
      return;
    }

    try {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', selectedTenantId)
        .single();

      if (tenantError || !tenantData) {
        throw new Error('No se pudo obtener información del tenant');
      }

      const pdfResult = await generateFormPDF(formConfig.tableName, {
        formType: formConfig.tableName,
        formData: data,
        afiliadoData: {
          nombre: afiliadoDetails.nombre,
          apellido: afiliadoDetails.apellido,
          dni: afiliadoDetails.dni,
          obra_social: afiliadoDetails.obra_social || undefined,
        },
        tenantData: {
          nombre: tenantData.nombre || '',
          cuit: tenantData.cuit || '',
          direccion: tenantData.direccion || '',
          telefono: tenantData.telefono || '',
          email: tenantData.email || '',
          logo_url: tenantData.logo_url || null,
        },
      });

      if (pdfResult.success) {
        const fileName = `FIM_${afiliadoDetails.apellido}_${afiliadoDetails.nombre}_${new Date().getTime()}`;

        if (pdfResult.htmlContent) {
          await downloadAndSharePDF(pdfResult.htmlContent, fileName);
        } else if (pdfResult.pdfDoc) {
          await downloadAndShareJsPDF(pdfResult.pdfDoc, fileName);
        } else {
          Alert.alert('Error', 'No se pudo generar el PDF');
        }
      } else {
        Alert.alert('Error', pdfResult.error || 'No se pudo generar el PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Ocurrió un error al generar el PDF');
    }
  };

  const handleSend = () => {
    Alert.alert('Información', 'Función de envío próximamente disponible');
  };

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
});

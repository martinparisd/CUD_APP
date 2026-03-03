import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FormConfig } from '@/types/formFields';
import DynamicFormField from './DynamicFormField';
import { FormAttachmentUpload } from './form-inputs';

interface DynamicFormProps {
  config: FormConfig;
  data: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
  onSave: () => void;
  onCancel?: () => void;
  loading?: boolean;
  saving?: boolean;
  editable?: boolean;
  recordId?: string;
  tableName: string;
  tenantId?: string;
}

export default function DynamicForm({
  config,
  data,
  onChange,
  errors,
  onSave,
  onCancel,
  loading = false,
  saving = false,
  editable = true,
  recordId,
  tableName,
  tenantId,
}: DynamicFormProps) {
  const attachmentFieldName = tableName === 'evaluaciones_interdisciplinarias' ? 'archivo_pdf' : 'archivo_adjunto';
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B4CDB" />
        <Text style={styles.loadingText}>Cargando formulario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {config.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.fieldsContainer}>
              {section.fields.map((field) => (
                <DynamicFormField
                  key={field.name}
                  field={field}
                  value={data[field.name]}
                  onChange={onChange}
                  error={errors[field.name]}
                  editable={editable}
                  tenantId={tenantId}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adjuntos</Text>
          <View style={styles.fieldsContainer}>
            <FormAttachmentUpload
              value={data[attachmentFieldName]}
              onChange={(value) => onChange(attachmentFieldName, value)}
              recordId={recordId}
              tableName={tableName}
              disabled={!editable}
            />
          </View>
        </View>
      </ScrollView>

      {editable && (
        <View style={styles.footer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onCancel}
              disabled={saving}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, saving && styles.buttonDisabled]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#5B4CDB',
  },
  fieldsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#5B4CDB',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

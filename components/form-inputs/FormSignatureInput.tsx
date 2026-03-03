import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera } from 'lucide-react-native';

interface FormSignatureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export default function FormSignatureInput({
  label,
  value,
  onChange,
  required = false,
  error,
  editable = true,
}: FormSignatureInputProps) {
  const handleCapture = () => {
    Alert.alert(
      'Captura de firma',
      'La funcionalidad de captura de firma estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.captureButton, !editable && styles.captureButtonDisabled]}
        onPress={handleCapture}
        disabled={!editable}
      >
        <Camera size={20} color={editable ? '#5B4CDB' : '#9CA3AF'} />
        <Text style={[styles.captureButtonText, !editable && styles.captureButtonTextDisabled]}>
          {value ? 'Firma capturada' : 'Capturar firma'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  captureButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#5B4CDB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captureButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B4CDB',
  },
  captureButtonTextDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

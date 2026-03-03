import { View, Text, TextInput, StyleSheet } from 'react-native';

interface FormNumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  editable?: boolean;
  min?: number;
  max?: number;
  decimal?: boolean;
}

export default function FormNumberInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  editable = true,
  min,
  max,
  decimal = false,
}: FormNumberInputProps) {
  const handleChangeText = (text: string) => {
    if (text === '') {
      onChange(null);
      return;
    }

    const numValue = decimal ? parseFloat(text) : parseInt(text, 10);
    if (isNaN(numValue)) return;

    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;

    onChange(numValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value !== null ? value.toString() : ''}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        editable={editable}
        placeholderTextColor="#9CA3AF"
      />
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

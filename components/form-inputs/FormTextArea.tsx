import { View, Text, TextInput, StyleSheet } from 'react-native';

interface FormTextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  editable?: boolean;
}

export default function FormTextArea({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  rows = 4,
  editable = true,
}: FormTextAreaProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textarea,
          { minHeight: rows * 24 },
          error && styles.textareaError,
          !editable && styles.textareaDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        numberOfLines={rows}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        textAlignVertical="top"
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
  textarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  textareaError: {
    borderColor: '#EF4444',
  },
  textareaDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

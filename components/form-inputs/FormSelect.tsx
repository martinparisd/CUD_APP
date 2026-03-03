import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  required = false,
  error,
  editable = true,
}: FormSelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View
        style={[
          styles.pickerContainer,
          error && styles.pickerContainerError,
          !editable && styles.pickerContainerDisabled,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          enabled={editable}
          style={styles.picker}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
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
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: '#EF4444',
  },
  pickerContainerDisabled: {
    backgroundColor: '#F3F4F6',
  },
  picker: {
    height: 44,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

import { View, Text, StyleSheet, Switch } from 'react-native';

interface FormToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  editable?: boolean;
}

export default function FormToggle({
  label,
  value,
  onChange,
  error,
  editable = true,
}: FormToggleProps) {
  console.log('FormToggle render:', { label, value, editable });

  const handleToggle = (newValue: boolean) => {
    console.log('FormToggle toggled:', { label, newValue });
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={handleToggle}
          disabled={!editable}
          trackColor={{ false: '#D1D5DB', true: '#5B4CDB' }}
          thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
          testID={`toggle-${label}`}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 12,
  },
});

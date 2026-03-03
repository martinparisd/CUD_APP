import { View, Text, StyleSheet } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

interface FormCheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  editable?: boolean;
}

export default function FormCheckbox({
  label,
  value,
  onChange,
  error,
  editable = true,
}: FormCheckboxProps) {
  return (
    <View style={styles.container}>
      <BouncyCheckbox
        isChecked={value}
        onPress={onChange}
        text={label}
        fillColor="#5B4CDB"
        unFillColor="#FFFFFF"
        iconStyle={styles.iconStyle}
        textStyle={styles.label}
        disabled={!editable}
        useBuiltInState={false}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconStyle: {
    borderColor: '#D1D5DB',
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textDecorationLine: 'none',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 32,
  },
});

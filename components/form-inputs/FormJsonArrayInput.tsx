import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react-native';

interface FormJsonArrayInputProps {
  label: string;
  value: any[];
  onChange: (value: any[]) => void;
  itemTemplate: Record<string, any>;
  itemLabels: Record<string, string>;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export default function FormJsonArrayInput({
  label,
  value = [],
  onChange,
  itemTemplate,
  itemLabels,
  required = false,
  error,
  editable = true,
}: FormJsonArrayInputProps) {
  const safeValue = Array.isArray(value) ? value : [];

  console.log('FormJsonArrayInput render:', { label, value, safeValue, isArray: Array.isArray(value) });

  const handleAddItem = () => {
    onChange([...safeValue, { ...itemTemplate }]);
  };

  const handleRemoveItem = (index: number) => {
    const newValue = safeValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleUpdateItem = (index: number, field: string, fieldValue: string) => {
    const newValue = [...safeValue];
    newValue[index] = { ...newValue[index], [field]: fieldValue };
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {editable && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Plus size={16} color="#5B4CDB" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>

      {safeValue.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>#{index + 1}</Text>
            {editable && (
              <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {Object.keys(itemTemplate).map((field) => (
            <View key={field} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{itemLabels[field] || field}</Text>
              <TextInput
                style={styles.input}
                value={item[field]?.toString() || ''}
                onChangeText={(text) => handleUpdateItem(index, field, text)}
                editable={editable}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ))}
        </View>
      ))}

      {safeValue.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay elementos agregados</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B4CDB',
  },
  itemContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B4CDB',
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

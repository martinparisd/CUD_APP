import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, FlatList, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, ChevronDown, X } from 'lucide-react-native';
import { FieldType } from '@/types/formFields';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchPrestadores } from '@/services/formRecordsService';

interface FormJsonArrayInputProps {
  label: string;
  value: any[];
  onChange: (value: any[]) => void;
  itemTemplate: Record<string, any>;
  itemLabels: Record<string, string>;
  itemTypes?: Record<string, FieldType>;
  itemSelectOptions?: Record<string, string>;
  required?: boolean;
  error?: string;
  editable?: boolean;
  tenantId?: string;
}

export default function FormJsonArrayInput({
  label,
  value = [],
  onChange,
  itemTemplate,
  itemLabels,
  itemTypes = {},
  itemSelectOptions = {},
  required = false,
  error,
  editable = true,
  tenantId,
}: FormJsonArrayInputProps) {
  const safeValue = Array.isArray(value) ? value : [];
  const [datePickers, setDatePickers] = useState<Record<string, { itemIndex: number; field: string; show: boolean }>>({});
  const [selectOptions, setSelectOptions] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const [openSelectField, setOpenSelectField] = useState<string | null>(null);
  const [prestadores, setPrestadores] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    loadSelectOptions();
  }, [tenantId, itemSelectOptions]);

  const loadSelectOptions = async () => {
    const options: Record<string, Array<{ label: string; value: string }>> = {};

    for (const [fieldName, tableName] of Object.entries(itemSelectOptions || {})) {
      if (tableName === 'prestadores' && tenantId) {
        const prestadoresData = await fetchPrestadores(tenantId);
        options[fieldName] = prestadoresData;
        setPrestadores(prestadoresData);
      }
    }

    setSelectOptions(options);
  };

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

  const getFieldType = (field: string): FieldType => {
    return itemTypes?.[field] || 'text';
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

          {Object.keys(itemTemplate).map((field) => {
            const fieldType = getFieldType(field);
            const fieldKey = `${index}_${field}`;

            if (fieldType === 'date') {
              return (
                <View key={field} style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>{itemLabels[field] || field}</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => editable && setDatePickers({ ...datePickers, [fieldKey]: { itemIndex: index, field, show: true } })}
                    disabled={!editable}
                  >
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.dateInputText}>
                      {item[field] || 'Seleccionar fecha'}
                    </Text>
                  </TouchableOpacity>
                  {datePickers[fieldKey]?.show && (
                    <DateTimePicker
                      value={item[field] ? new Date(item[field]) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        if (event.type === 'dismissed') {
                          setDatePickers({ ...datePickers, [fieldKey]: { ...datePickers[fieldKey], show: false } });
                        } else if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          handleUpdateItem(index, field, formattedDate);
                          setDatePickers({ ...datePickers, [fieldKey]: { ...datePickers[fieldKey], show: false } });
                        }
                      }}
                    />
                  )}
                </View>
              );
            }

            if (fieldType === 'select') {
              const selectedValue = item[field];
              const selectedLabel = prestadores.find(p => p.value === selectedValue)?.label || (selectedValue ? `ID: ${selectedValue}` : 'Seleccionar...');
              const fieldModalKey = `${index}_${field}`;

              return (
                <View key={field} style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>{itemLabels[field] || field}</Text>
                  <TouchableOpacity
                    style={styles.selectFieldButton}
                    onPress={() => editable && setOpenSelectField(fieldModalKey)}
                    disabled={!editable}
                  >
                    <Text style={[styles.selectFieldText, !selectedValue && styles.placeholderText]}>
                      {selectedLabel}
                    </Text>
                    <ChevronDown size={16} color="#6B7280" />
                  </TouchableOpacity>

                  <Modal
                    visible={openSelectField === fieldModalKey}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setOpenSelectField(null)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>{itemLabels[field] || field}</Text>
                          <TouchableOpacity onPress={() => setOpenSelectField(null)}>
                            <X size={24} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                        <FlatList
                          data={prestadores}
                          keyExtractor={(item) => item.value}
                          renderItem={({ item: option }) => (
                            <TouchableOpacity
                              style={styles.modalOption}
                              onPress={() => {
                                handleUpdateItem(index, field, option.value);
                                setOpenSelectField(null);
                              }}
                            >
                              <Text style={[styles.modalOptionText, selectedValue === option.value && styles.modalOptionSelected]}>
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </View>
                  </Modal>
                </View>
              );
            }

            return (
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
            );
          })}
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
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInputText: {
    fontSize: 14,
    color: '#1F2937',
  },
  selectContainer: {
    position: 'relative',
  },
  selectInput: {
    paddingRight: 28,
  },
  selectIcon: {
    position: 'absolute',
    right: 10,
    top: 8,
  },
  selectFieldButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOptionSelected: {
    fontWeight: '600',
    color: '#5B4CDB',
  },
});

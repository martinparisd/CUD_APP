import { View, StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import FormRecordList from './FormRecordList';
import { fetchFormRecords, FormRecord } from '@/services/formRecordsService';
import { getFormTableConfig } from '@/config/formTables';
import { useTenant } from '@/contexts/TenantContext';

interface FormPageProps {
  title: string;
}

export default function FormPage({ title }: FormPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { selectedTenantId } = useTenant();

  const routeName = segments[segments.length - 1] as string;
  const tableConfig = getFormTableConfig(routeName);

  useEffect(() => {
    loadRecords();
  }, [selectedTenantId]);

  const loadRecords = async () => {
    if (!tableConfig) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await fetchFormRecords(tableConfig.tableName, '', selectedTenantId);
    setRecords(data);
    setLoading(false);
  };

  const handleRecordPress = (record: FormRecord) => {
    console.log('Opening record:', record.id);
  };

  const filteredRecords = searchQuery
    ? records.filter((record) => {
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${record.afiliado_nombre} ${record.afiliado_apellido}`.toLowerCase();
        return fullName.includes(searchLower);
      })
    : records;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      <FormRecordList
        records={filteredRecords}
        loading={loading}
        onRecordPress={handleRecordPress}
        formRouteName={routeName}
        formDisplayName={tableConfig?.displayName || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    padding: 0,
  },
});

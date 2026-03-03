import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface FormItem {
  id: string;
  title: string;
  route: string;
}

const formItems: FormItem[] = [
  {
    id: '1',
    title: 'Evaluación Interdisciplinaria',
    route: '/formularios/evaluacion-interdisciplinaria',
  },
  {
    id: '2',
    title: 'Anexo III Conformidad Prestacional',
    route: '/formularios/anexo-conformidad',
  },
  {
    id: '3',
    title: 'Formulario de FIM',
    route: '/formularios/formulario-fim',
  },
  {
    id: '4',
    title: 'Formulario Pedido Médico',
    route: '/formularios/formulario-pedido-medico',
  },
  {
    id: '5',
    title: 'Resumen Historia Clínica',
    route: '/formularios/resumen-historia-clinica',
  },
  {
    id: '6',
    title: 'RE 158 - Informe Inicio/Continuidad',
    route: '/formularios/re158-informe',
  },
  {
    id: '7',
    title: 'RE 159 - Plan de Tratamiento',
    route: '/formularios/re159-plan-tratamiento',
  },
  {
    id: '8',
    title: 'RE 160 - Presupuesto Prestaciones',
    route: '/formularios/re160-presupuesto',
  },
  {
    id: '9',
    title: 'RE 161 - Ficha del Prestador',
    route: '/formularios/re161-ficha-prestador',
  },
];

export default function FormulariosIndex() {
  const router = useRouter();

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Formulario de servicios</Text>
      <Text style={styles.headerSubtitle}>
        Accede a todos los formularios disponibles
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {formItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.formItem,
                index === 0 && styles.firstItem,
                index === formItems.length - 1 && styles.lastItem,
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}>
              <View style={styles.iconContainer}>
                <FileText size={24} color="#6366F1" strokeWidth={2} />
              </View>
              <Text style={styles.formTitle}>{item.title}</Text>
              <ChevronRight size={20} color="#D1D5DB" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  firstItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  formTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 22,
  },
});

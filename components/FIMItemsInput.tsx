import { View, Text, StyleSheet, TextInput } from 'react-native';
import { FormSelect } from './form-inputs';

interface FIMItem {
  number: number;
  key: string;
  label: string;
  description: string;
}

interface FIMItemData {
  score?: number;
  notes?: string;
}

const FIM_ITEMS: FIMItem[] = [
  {
    number: 1,
    key: 'item_1',
    label: 'Alimentación',
    description: 'Implica uso de utensilios, masticar y tragar la comida. Especifique grado de supervisión o asistencia necesaria para la alimentación del paciente y qué medidas se han tomado para superar la situación.',
  },
  {
    number: 2,
    key: 'item_2',
    label: 'Aseo personal',
    description: 'Implica lavarse la cara y manos, peinarse, afeitarse o maquillarse, y lavarse los dientes. Indique las características de esta asistencia. ¿Es necesaria la supervisión y/o preparación de los elementos de higiene?',
  },
  {
    number: 3,
    key: 'item_3',
    label: 'Higiene (baño)',
    description: 'Implica aseo desde el cuello hacia abajo, en bañera, ducha o baño de esponja en cama. Indique si el baño corporal requiere supervisión o asistencia, y el grado de participación del paciente.',
  },
  {
    number: 4,
    key: 'item_4',
    label: 'Vestido parte superior',
    description: 'Implica vestirse desde la cintura hacia arriba, así como colocar órtesis y prótesis. Características de la dependencia.',
  },
  {
    number: 5,
    key: 'item_5',
    label: 'Vestido parte inferior',
    description: 'Implica vestirse desde la cintura hacia abajo, incluye ponerse zapatos, abrocharse y colocar órtesis y prótesis. Características de la dependencia.',
  },
  {
    number: 6,
    key: 'item_6',
    label: 'Uso del baño',
    description: 'Implica mantener la higiene perineal y ajustar las ropas antes y después del uso del baño o chata.',
  },
  {
    number: 7,
    key: 'item_7',
    label: 'Control de intestinos',
    description: 'Implica el control completo e intencional de la evacuación intestinal y el uso de equipo o agentes necesarios para la evacuación. Ejemplo: catéteres o dispositivos de ostomía. Frecuencia.',
  },
  {
    number: 8,
    key: 'item_8',
    label: 'Control de vejiga',
    description: 'Implica el control completo e intencional de la evacuación vesical y el uso de equipos o agentes necesarios para la evacuación, como sondas o dispositivos absorbentes. Frecuencia.',
  },
  {
    number: 9,
    key: 'item_9',
    label: 'Transferencia a la cama, silla o silla de ruedas',
    description: 'Implica pararse hacia una cama, silla, silla de ruedas, volver a la posición inicial. Si camina lo debe hacer de pie. Grado de participación del paciente.',
  },
  {
    number: 10,
    key: 'item_10',
    label: 'Transferencia al baño',
    description: 'Implica sentarse y salir del inodoro. Grado de participación del paciente.',
  },
  {
    number: 11,
    key: 'item_11',
    label: 'Transferencia a la ducha o bañera',
    description: 'Implica entrar y salir de la ducha o bañera.',
  },
  {
    number: 12,
    key: 'item_12',
    label: 'Marcha/silla de ruedas',
    description: 'Implica caminar sobre una superficie llana una vez que está en pie o propulsar su silla de ruedas.',
  },
  {
    number: 13,
    key: 'item_13',
    label: 'Escaleras',
    description: 'Implica subir o bajar escalones.',
  },
  {
    number: 14,
    key: 'item_14',
    label: 'Comprensión',
    description: 'Implica el entendimiento de la comunicación auditiva o visual. Ej.: escritura, gestos, signos, etc.',
  },
  {
    number: 15,
    key: 'item_15',
    label: 'Expresión',
    description: 'Implica la expresión clara del lenguaje verbal y no verbal.',
  },
  {
    number: 16,
    key: 'item_16',
    label: 'Interacción social',
    description: 'Implica hacerse entender, participar con otros en situaciones sociales y respetar límites. Detalle las características conductuales del paciente respecto al grado de participación en distintas situaciones sociales y terapéuticas, describiendo el nivel de acción conductual frente a la distancia que impliquen desadaptación, aislcomo el grado de impacto como sí mismo y el entorno.',
  },
  {
    number: 17,
    key: 'item_17',
    label: 'Resolución de problemas',
    description: 'Implica resolver problemas cotidianos.',
  },
  {
    number: 18,
    key: 'item_18',
    label: 'Memoria',
    description: 'Implica habilidad para el reconocimiento y memorización de actividades simples y/o rostros familiares.',
  },
];

const SCORE_OPTIONS = [
  { label: 'Puntaje', value: '' },
  { label: '7 — Independencia completa', value: '7' },
  { label: '6 — Independencia modificada', value: '6' },
  { label: '5 — Supervisión/preparación', value: '5' },
  { label: '4 — Asistencia mínima (≥75%)', value: '4' },
  { label: '3 — Asistencia moderada (≥50%)', value: '3' },
  { label: '2 — Asistencia máxima (≥25%)', value: '2' },
  { label: '1 — Asistencia total (<25%)', value: '1' },
];

const CATEGORIES = [
  { title: 'Autocuidado', items: FIM_ITEMS.slice(0, 6) },
  { title: 'Control de Esfínteres', items: FIM_ITEMS.slice(6, 8) },
  { title: 'Transferencias', items: FIM_ITEMS.slice(8, 11) },
  { title: 'Locomoción', items: FIM_ITEMS.slice(11, 13) },
  { title: 'Comunicación', items: FIM_ITEMS.slice(13, 15) },
  { title: 'Cognición Social', items: FIM_ITEMS.slice(15, 18) },
];

interface FIMItemsInputProps {
  value: Record<string, FIMItemData | number> | null;
  onChange: (value: Record<string, FIMItemData>) => void;
  disabled?: boolean;
}

export default function FIMItemsInput({ value = {}, onChange, disabled = false }: FIMItemsInputProps) {
  const items = value || {};

  // Normalize old format (just numbers) to new format (objects with score and notes)
  const normalizeItemData = (itemKey: string): FIMItemData => {
    const itemValue = items[itemKey];
    if (typeof itemValue === 'number') {
      return { score: itemValue, notes: '' };
    }
    return itemValue || { score: undefined, notes: '' };
  };

  const handleScoreChange = (itemKey: string, score: string) => {
    const newItems = { ...items } as Record<string, FIMItemData>;
    const currentData = normalizeItemData(itemKey);

    if (score) {
      newItems[itemKey] = { ...currentData, score: parseInt(score, 10) };
    } else {
      newItems[itemKey] = { ...currentData, score: undefined };
    }
    onChange(newItems);
  };

  const handleNotesChange = (itemKey: string, notes: string) => {
    const newItems = { ...items } as Record<string, FIMItemData>;
    const currentData = normalizeItemData(itemKey);
    newItems[itemKey] = { ...currentData, notes };
    onChange(newItems);
  };

  const calculateTotal = (): number => {
    return Object.values(items).reduce((sum: number, itemData: FIMItemData | number) => {
      const score = typeof itemData === 'number' ? itemData : (itemData?.score || 0);
      return sum + score;
    }, 0);
  };

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.items.map((item) => {
            const itemData = normalizeItemData(item.key);
            return (
              <View key={item.key} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNumber}>{item.number}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>

                <TextInput
                  style={[
                    styles.notesInput,
                    disabled && styles.notesInputDisabled,
                  ]}
                  value={itemData.notes || ''}
                  onChangeText={(text) => handleNotesChange(item.key, text)}
                  placeholder={item.description}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  editable={!disabled}
                  textAlignVertical="top"
                />

                <FormSelect
                  label=""
                  value={itemData.score?.toString() || ''}
                  onChange={(newValue) => handleScoreChange(item.key, newValue)}
                  options={SCORE_OPTIONS}
                  editable={!disabled}
                />
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Puntaje Total</Text>
        <Text style={styles.totalValue}>{calculateTotal()} / 126</Text>
        <Text style={styles.totalHint}>Suma de los 18 items (mínimo 18, máximo 126)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  category: {
    gap: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#5B4CDB',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B4CDB',
    backgroundColor: '#EDE9FE',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 120,
    marginBottom: 0,
  },
  notesInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  totalContainer: {
    backgroundColor: '#EDE9FE',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B4CDB',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5B4CDB',
  },
  totalHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

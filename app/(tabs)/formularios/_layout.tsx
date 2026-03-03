import { Stack } from 'expo-router';

export default function FormulariosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#5B4CDB',
        },
        headerTintColor: '#FFFFFF',
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="evaluacion-interdisciplinaria"
        options={{
          title: 'Evaluación Interdisciplinaria',
        }}
      />
      <Stack.Screen
        name="anexo-conformidad"
        options={{
          title: 'Anexo III Conformidad Prestacional',
        }}
      />
      <Stack.Screen
        name="formulario-fim"
        options={{
          title: 'Formulario de FIM',
        }}
      />
      <Stack.Screen
        name="formulario-pedido-medico"
        options={{
          title: 'Formulario Pedido Médico',
        }}
      />
      <Stack.Screen
        name="resumen-historia-clinica"
        options={{
          title: 'Resumen Historia Clínica',
        }}
      />
      <Stack.Screen
        name="re158-informe"
        options={{
          title: 'RE158 Informe',
        }}
      />
      <Stack.Screen
        name="re159-plan-tratamiento"
        options={{
          title: 'RE159 Plan de Tratamiento',
        }}
      />
      <Stack.Screen
        name="re160-presupuesto"
        options={{
          title: 'RE160 Presupuesto',
        }}
      />
      <Stack.Screen
        name="re161-ficha-prestador"
        options={{
          title: 'RE161 Ficha del Prestador',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="historial"
        options={{
          title: 'Historial',
        }}
      />
    </Stack>
  );
}

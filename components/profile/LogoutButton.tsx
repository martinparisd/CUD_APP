import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useState } from 'react';

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onLogout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleLogout}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <LogOut size={20} color="#EF4444" strokeWidth={2} />
      )}
      <Text style={styles.buttonText}>Cerrar sesión</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '@/services/userProfileService';

interface ProfileInfoCardProps {
  profile: UserProfile;
}

export default function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  const fullName = [profile.name, profile.last_name].filter(Boolean).join(' ') || 'Sin nombre';

  const infoRows = [
    { label: 'Nombre', value: fullName },
    { label: 'Email', value: profile.email || 'No disponible' },
    { label: 'DNI', value: profile.dni || 'No disponible' },
    { label: 'Teléfono', value: profile.phone || 'No disponible' },
    { label: 'Celular', value: profile.cellphone || 'No disponible' },
    { label: 'Departamento', value: profile.department || 'No disponible' },
    { label: 'Ubicación', value: profile.location || 'No disponible' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.name?.[0] || profile.email?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>{fullName}</Text>
          {profile.is_super_admin && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Administrador</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoSection}>
        {infoRows.map((row, index) => (
          <View key={index} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#5B4CDB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B4CDB',
    textTransform: 'uppercase',
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
});

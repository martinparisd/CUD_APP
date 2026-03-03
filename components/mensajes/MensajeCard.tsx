import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, MailOpen, MessageSquare, Clock } from 'lucide-react-native';
import { MensajeCompleto } from '@/types/mensaje';

interface MensajeCardProps {
  mensaje: MensajeCompleto;
  onPress: () => void;
}

export default function MensajeCard({ mensaje, onPress }: MensajeCardProps) {
  const isUnread = !mensaje.destinatario.is_read;
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('es-AR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          {isUnread ? (
            <Mail size={20} color="#5B4CDB" />
          ) : (
            <MailOpen size={20} color="#9CA3AF" />
          )}
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[mensaje.priority] }]}>
            <Text style={styles.priorityText}>{mensaje.priority.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          <Clock size={14} color="#9CA3AF" />
          <Text style={styles.dateText}>{formatDate(mensaje.created_at)}</Text>
        </View>
      </View>

      <Text style={[styles.subject, isUnread && styles.unreadText]} numberOfLines={1}>
        {mensaje.subject}
      </Text>

      <Text style={styles.message} numberOfLines={2}>
        {mensaje.message}
      </Text>

      {mensaje.reply_count !== undefined && mensaje.reply_count > 0 && (
        <View style={styles.footer}>
          <MessageSquare size={16} color="#6B7280" />
          <Text style={styles.replyCount}>
            {mensaje.reply_count} {mensaje.reply_count === 1 ? 'respuesta' : 'respuestas'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#5B4CDB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  replyCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});

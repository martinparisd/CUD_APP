import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { X, Send, Clock, User } from 'lucide-react-native';
import { MensajeCompleto, RespuestaConUsuario } from '@/types/mensaje';
import { useState, useEffect } from 'react';

interface MensajeDetailSheetProps {
  isVisible: boolean;
  mensaje: MensajeCompleto | null;
  replies: RespuestaConUsuario[];
  currentUserId: string;
  onClose: () => void;
  onSendReply: (message: string) => Promise<void>;
  loadingReplies: boolean;
}

export default function MensajeDetailSheet({
  isVisible,
  mensaje,
  replies,
  currentUserId,
  onClose,
  onSendReply,
  loadingReplies,
}: MensajeDetailSheetProps) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setReplyText('');
    }
  }, [isVisible]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      await onSendReply(replyText.trim());
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626',
  };

  if (!mensaje) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mensaje</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors[mensaje.priority] }]}>
                <Text style={styles.priorityText}>{mensaje.priority.toUpperCase()}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Clock size={14} color="#9CA3AF" />
                <Text style={styles.dateText}>{formatDate(mensaje.created_at)}</Text>
              </View>
            </View>

            <Text style={styles.subject}>{mensaje.subject}</Text>
            <Text style={styles.message}>{mensaje.message}</Text>
          </View>

          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>
              Respuestas ({replies.length})
            </Text>

            {loadingReplies ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#5B4CDB" />
              </View>
            ) : replies.length === 0 ? (
              <Text style={styles.noReplies}>No hay respuestas aún</Text>
            ) : (
              replies.map((reply) => (
                <View
                  key={reply.id}
                  style={[
                    styles.replyCard,
                    reply.user_id === currentUserId && styles.myReplyCard,
                  ]}
                >
                  <View style={styles.replyHeader}>
                    <View style={styles.replyUser}>
                      <User size={14} color="#6B7280" />
                      <Text style={styles.replyUserText}>
                        {reply.user_id === currentUserId ? 'Tú' : reply.user_email || 'Usuario'}
                      </Text>
                    </View>
                    <Text style={styles.replyDate}>{formatDate(reply.created_at)}</Text>
                  </View>
                  <Text style={styles.replyMessage}>{reply.message}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Escribe tu respuesta..."
            placeholderTextColor="#9CA3AF"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!replyText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!replyText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  repliesSection: {
    marginBottom: 16,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noReplies: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  replyCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  myReplyCard: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: '#5B4CDB',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyUserText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  replyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  replyMessage: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#5B4CDB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});

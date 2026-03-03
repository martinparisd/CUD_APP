import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { mensajesService } from '@/services/mensajesService';
import { MensajeCompleto, RespuestaConUsuario } from '@/types/mensaje';
import MensajeCard from '@/components/mensajes/MensajeCard';
import MensajeDetailSheet from '@/components/mensajes/MensajeDetailSheet';

export default function MensajesScreen() {
  const { user } = useAuth();
  const { currentTenantId } = useTenant();
  const [mensajes, setMensajes] = useState<MensajeCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMensaje, setSelectedMensaje] = useState<MensajeCompleto | null>(null);
  const [replies, setReplies] = useState<RespuestaConUsuario[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadMensajes = async () => {
    console.log('[MensajesScreen] loadMensajes called', { user: user?.id, currentTenantId });

    if (!user || !currentTenantId) {
      console.log('[MensajesScreen] Missing user or tenantId, returning early');
      return;
    }

    try {
      console.log('[MensajesScreen] Calling getMensajesForUser...');
      const data = await mensajesService.getMensajesForUser(user.id, currentTenantId, 50, 0);
      console.log('[MensajesScreen] Received mensajes:', data.length);
      setMensajes(data);
    } catch (error) {
      console.error('[MensajesScreen] Error loading mensajes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMensajes();
  }, [user, currentTenantId]);

  useEffect(() => {
    console.log('[MensajesScreen] useEffect triggered', { user: user?.id, currentTenantId });
    loadMensajes();

    if (user && currentTenantId) {
      console.log('[MensajesScreen] Setting up subscription...');
      const subscription = mensajesService.subscribeToMensajes(user.id, currentTenantId, () => {
        console.log('[MensajesScreen] Subscription callback triggered, reloading...');
        loadMensajes();
      });

      return () => {
        console.log('[MensajesScreen] Unsubscribing from mensajes...');
        subscription.unsubscribe();
      };
    }
  }, [user, currentTenantId]);

  const handleOpenMensaje = async (mensaje: MensajeCompleto) => {
    console.log('[MensajesScreen] handleOpenMensaje called', { mensajeId: mensaje.id });
    setSelectedMensaje(mensaje);
    setLoadingReplies(true);

    try {
      if (!mensaje.destinatario.is_read && user) {
        console.log('[MensajesScreen] Marking mensaje as read...');
        await mensajesService.markAsRead(mensaje.destinatario.id, user.id);
        setMensajes((prev) =>
          prev.map((m) =>
            m.id === mensaje.id
              ? {
                  ...m,
                  destinatario: { ...m.destinatario, is_read: true, read_at: new Date().toISOString() },
                }
              : m
          )
        );
      }

      if (user) {
        console.log('[MensajesScreen] Loading replies...');
        const repliesData = await mensajesService.getReplies(mensaje.id, user.id);
        console.log('[MensajesScreen] Replies loaded:', repliesData.length);
        setReplies(repliesData);
      }
    } catch (error) {
      console.error('[MensajesScreen] Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSendReply = async (message: string) => {
    console.log('[MensajesScreen] handleSendReply called', { message });

    if (!user || !currentTenantId || !selectedMensaje) {
      console.log('[MensajesScreen] Missing user, tenantId, or selectedMensaje');
      return;
    }

    try {
      console.log('[MensajesScreen] Creating reply...');
      const newReply = await mensajesService.createReply(
        selectedMensaje.id,
        selectedMensaje.destinatario.id,
        user.id,
        currentTenantId,
        message
      );

      console.log('[MensajesScreen] Reply created, updating UI');
      setReplies((prev) => [
        ...prev,
        {
          ...newReply,
          user_email: user.email || undefined,
        },
      ]);

      setMensajes((prev) =>
        prev.map((m) =>
          m.id === selectedMensaje.id
            ? { ...m, reply_count: (m.reply_count || 0) + 1 }
            : m
        )
      );
    } catch (error) {
      console.error('[MensajesScreen] Error sending reply:', error);
      throw error;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mensajes</Text>
      <Text style={styles.headerSubtitle}>
        Comunícate con tu equipo de salud
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No hay mensajes</Text>
      <Text style={styles.emptySubtext}>Los mensajes aparecerán aquí</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B4CDB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <FlatList
        data={mensajes}
        renderItem={({ item }) => (
          <MensajeCard
            mensaje={item}
            onPress={() => handleOpenMensaje(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5B4CDB"
          />
        }
      />
      {selectedMensaje && (
        <MensajeDetailSheet
          isVisible={!!selectedMensaje}
          mensaje={selectedMensaje}
          replies={replies}
          currentUserId={user?.id || ''}
          onClose={() => {
            setSelectedMensaje(null);
            setReplies([]);
          }}
          onSendReply={handleSendReply}
          loadingReplies={loadingReplies}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

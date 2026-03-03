import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { novedadesService } from '@/services/novedadesService';
import { Novedad, NovedadComment } from '@/types/novedad';
import NovedadCard from '@/components/novedades/NovedadCard';
import CommentSheet from '@/components/novedades/CommentSheet';
import { useFocusEffect } from '@react-navigation/native';

export default function NovedadesTab() {
  const { user } = useAuth();
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedNovedades, setLikedNovedades] = useState<Set<string>>(new Set());
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);
  const [comments, setComments] = useState<NovedadComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadNovedades = async () => {
    try {
      const data = await novedadesService.getNovedades(20, 0);
      setNovedades(data);

      if (user) {
        const likes = new Set<string>();
        for (const novedad of data) {
          const isLiked = await novedadesService.checkUserLike(novedad.id, user.id);
          if (isLiked) {
            likes.add(novedad.id);
          }
        }
        setLikedNovedades(likes);
      }
    } catch (error) {
      console.error('Error loading novedades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNovedades();
  }, []);

  useEffect(() => {
    loadNovedades();

    const subscription = novedadesService.subscribeToNovedades(() => {
      loadNovedades();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        novedadesService.markAsRead(user.id).catch((error) => {
          console.error('Error marking novedades as read:', error);
        });
      }
    }, [user])
  );

  const handleLike = async (novedadId: string) => {
    if (!user) return;

    try {
      const isLiked = await novedadesService.toggleLike(novedadId, user.id);

      setLikedNovedades((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(novedadId);
        } else {
          newSet.delete(novedadId);
        }
        return newSet;
      });

      setNovedades((prev) =>
        prev.map((n) =>
          n.id === novedadId
            ? { ...n, likes_count: n.likes_count + (isLiked ? 1 : -1) }
            : n
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleOpenComments = async (novedad: Novedad) => {
    setSelectedNovedad(novedad);
    setLoadingComments(true);
    try {
      const commentsData = await novedadesService.getComments(novedad.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user || !selectedNovedad) return;

    try {
      const newComment = await novedadesService.addComment(
        selectedNovedad.id,
        user.id,
        content
      );
      setComments((prev) => [...prev, newComment]);

      setNovedades((prev) =>
        prev.map((n) =>
          n.id === selectedNovedad.id
            ? { ...n, comments_count: n.comments_count + 1 }
            : n
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedNovedad) return;

    try {
      await novedadesService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      setNovedades((prev) =>
        prev.map((n) =>
          n.id === selectedNovedad.id
            ? { ...n, comments_count: Math.max(0, n.comments_count - 1) }
            : n
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Novedades</Text>
      <Text style={styles.headerSubtitle}>
        Mantente actualizado con las últimas noticias
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay novedades disponibles</Text>
      <Text style={styles.emptySubtext}>Vuelve más tarde para ver nuevas actualizaciones</Text>
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
        data={novedades}
        renderItem={({ item }) => (
          <NovedadCard
            novedad={item}
            isLiked={likedNovedades.has(item.id)}
            onLike={() => handleLike(item.id)}
            onComment={() => handleOpenComments(item)}
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
            colors={['#5B4CDB']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {selectedNovedad && (
        <CommentSheet
          visible={!!selectedNovedad}
          comments={comments}
          currentUserId={user?.id || ''}
          onClose={() => {
            setSelectedNovedad(null);
            setComments([]);
          }}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

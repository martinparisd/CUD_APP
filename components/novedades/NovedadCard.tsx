import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Heart, MessageCircle, Pin, Calendar, CircleAlert as AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Novedad } from '@/types/novedad';
import { useState } from 'react';

interface NovedadCardProps {
  novedad: Novedad;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
}

const MAX_CONTENT_LENGTH = 280;

export default function NovedadCard({ novedad, isLiked, onLike, onComment }: NovedadCardProps) {
  const [liking, setLiking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await onLike();
    } finally {
      setLiking(false);
    }
  };

  const getCriticalityColor = (criticidad: string) => {
    switch (criticidad) {
      case 'critica':
        return '#DC2626';
      case 'alta':
        return '#EA580C';
      case 'media':
        return '#F59E0B';
      case 'baja':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace menos de 1h';
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const parseContentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s<>]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        let displayUrl = part;
        try {
          const url = new URL(part);
          displayUrl = url.hostname + (url.pathname.length > 1 ? url.pathname.substring(0, 30) + '...' : '');
        } catch (e) {
          displayUrl = part.length > 40 ? part.substring(0, 40) + '...' : part;
        }

        return (
          <Text
            key={index}
            style={styles.link}
            onPress={() => Linking.openURL(part)}>
            {displayUrl}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const shouldTruncate = novedad.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate && !expanded
    ? novedad.content.substring(0, MAX_CONTENT_LENGTH) + '...'
    : novedad.content;

  return (
    <View style={[styles.card, novedad.pinned && styles.pinnedCard]}>
      {novedad.pinned && (
        <View style={styles.pinnedBadge}>
          <Pin size={14} color="#5B4CDB" />
          <Text style={styles.pinnedText}>Fijado</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {novedad.author_name?.charAt(0).toUpperCase() || 'G'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.authorName}>{novedad.author_name || 'GEMA SM'}</Text>
          <Text style={styles.timestamp}>{formatDate(novedad.created_at)}</Text>
        </View>
        <View style={[styles.criticalityBadge, { backgroundColor: getCriticalityColor(novedad.criticidad) }]}>
          <Text style={styles.criticalityText}>{novedad.criticidad.toUpperCase()}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.content}>{parseContentWithLinks(displayContent)}</Text>
        {shouldTruncate && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.expandButton}
            activeOpacity={0.7}>
            <Text style={styles.expandButtonText}>
              {expanded ? 'Ver menos' : 'Ver más'}
            </Text>
            {expanded ? (
              <ChevronUp size={16} color="#5B4CDB" />
            ) : (
              <ChevronDown size={16} color="#5B4CDB" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {novedad.modulos_impactados.length > 0 && (
        <View style={styles.modulosContainer}>
          {novedad.modulos_impactados.map((modulo, index) => (
            <View key={index} style={styles.moduloTag}>
              <Text style={styles.moduloText}>{modulo}</Text>
            </View>
          ))}
        </View>
      )}

      {novedad.accion_requerida && (
        <View style={styles.accionContainer}>
          <AlertCircle size={16} color="#2563EB" />
          <Text style={styles.accionText}>{novedad.accion_requerida}</Text>
        </View>
      )}

      {novedad.fecha_vigencia && (
        <View style={styles.vigenciaContainer}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.vigenciaText}>
            Vigencia: {new Date(novedad.fecha_vigencia).toLocaleDateString('es-ES')}
          </Text>
        </View>
      )}

      {novedad.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {novedad.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          disabled={liking}
          activeOpacity={0.7}>
          <Heart
            size={20}
            color={isLiked ? '#DC2626' : '#6B7280'}
            fill={isLiked ? '#DC2626' : 'none'}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {novedad.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}>
          <MessageCircle size={20} color="#6B7280" />
          <Text style={styles.actionText}>{novedad.comments_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedCard: {
    borderColor: '#5B4CDB',
    borderWidth: 2,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B4CDB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B4CDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  criticalityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  criticalityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
    marginBottom: 8,
  },
  link: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#5B4CDB',
    fontWeight: '600',
  },
  modulosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  moduloTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moduloText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  accionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  accionText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  vigenciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  vigenciaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    fontSize: 13,
    color: '#5B4CDB',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#DC2626',
  },
});

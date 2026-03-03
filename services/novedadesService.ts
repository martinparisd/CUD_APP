import { supabase } from '@/lib/supabase';
import { Novedad, NovedadComment } from '@/types/novedad';

export const novedadesService = {
  async getNovedades(limit = 20, offset = 0): Promise<Novedad[]> {
    const { data, error } = await supabase
      .from('novedades')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async checkUserLike(novedadId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('novedad_likes')
      .select('id')
      .eq('novedad_id', novedadId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async toggleLike(novedadId: string, userId: string): Promise<boolean> {
    const isLiked = await this.checkUserLike(novedadId, userId);

    if (isLiked) {
      const { error } = await supabase
        .from('novedad_likes')
        .delete()
        .eq('novedad_id', novedadId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('novedad_likes')
        .insert({ novedad_id: novedadId, user_id: userId });

      if (error) throw error;
      return true;
    }
  },

  async getComments(novedadId: string): Promise<NovedadComment[]> {
    const { data, error } = await supabase
      .from('novedad_comments')
      .select('*')
      .eq('novedad_id', novedadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addComment(
    novedadId: string,
    userId: string,
    content: string
  ): Promise<NovedadComment> {
    const { data, error } = await supabase
      .from('novedad_comments')
      .insert({
        novedad_id: novedadId,
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('novedad_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  subscribeToNovedades(callback: (payload: any) => void) {
    return supabase
      .channel('novedades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'novedades',
        },
        callback
      )
      .subscribe();
  },

  subscribeToLikes(novedadId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`novedad_likes_${novedadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'novedad_likes',
          filter: `novedad_id=eq.${novedadId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToComments(novedadId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`novedad_comments_${novedadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'novedad_comments',
          filter: `novedad_id=eq.${novedadId}`,
        },
        callback
      )
      .subscribe();
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data: readStatus, error: readError } = await supabase
      .from('novedades_read_status')
      .select('last_seen_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (readError) throw readError;

    const lastSeenAt = readStatus?.last_seen_at || '1970-01-01T00:00:00Z';

    const { count, error } = await supabase
      .from('novedades')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', lastSeenAt);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('novedades_read_status')
      .upsert(
        {
          user_id: userId,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) throw error;
  },
};

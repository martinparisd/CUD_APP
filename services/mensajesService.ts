import { supabase } from '@/lib/supabase';
import {
  NotificacionInterna,
  NotificacionDestinatario,
  NotificacionRespuesta,
  MensajeCompleto,
  RespuestaConUsuario,
} from '@/types/mensaje';

class MensajesService {
  async getMensajesForUser(userId: string, tenantId: string, limit = 50, offset = 0): Promise<MensajeCompleto[]> {
    console.log('[getMensajesForUser] Starting - userId:', userId, 'tenantId:', tenantId);

    const { data: destinatarios, error: destError } = await supabase
      .from('notificacion_destinatarios')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('[getMensajesForUser] Destinatarios result:', { count: destinatarios?.length, error: destError });

    if (destError) throw destError;
    if (!destinatarios || destinatarios.length === 0) {
      console.log('[getMensajesForUser] No destinatarios found');
      return [];
    }

    const notificacionIds = destinatarios.map((d) => d.notificacion_id);
    console.log('[getMensajesForUser] Fetching notificaciones for IDs:', notificacionIds);

    const { data: notificaciones, error: notError } = await supabase
      .from('notificaciones_internas')
      .select('*')
      .in('id', notificacionIds)
      .order('created_at', { ascending: false });

    console.log('[getMensajesForUser] Notificaciones result:', { count: notificaciones?.length, error: notError });

    if (notError) throw notError;
    if (!notificaciones) {
      console.log('[getMensajesForUser] No notificaciones found');
      return [];
    }

    const { data: repliesCount, error: countError } = await supabase
      .from('notificacion_respuestas')
      .select('notificacion_id')
      .in('notificacion_id', notificacionIds);

    console.log('[getMensajesForUser] Replies count result:', { count: repliesCount?.length, error: countError });

    const replyCountMap = new Map<string, number>();
    if (repliesCount && !countError) {
      repliesCount.forEach((reply) => {
        replyCountMap.set(
          reply.notificacion_id,
          (replyCountMap.get(reply.notificacion_id) || 0) + 1
        );
      });
    }

    const mensajes: MensajeCompleto[] = notificaciones.map((notif) => {
      const destinatario = destinatarios.find((d) => d.notificacion_id === notif.id);
      return {
        ...notif,
        destinatario: destinatario!,
        reply_count: replyCountMap.get(notif.id) || 0,
      };
    });

    console.log('[getMensajesForUser] Returning mensajes:', mensajes.length);
    return mensajes;
  }

  async getMensajeById(notificacionId: string, userId: string): Promise<MensajeCompleto | null> {
    const { data: destinatario, error: destError } = await supabase
      .from('notificacion_destinatarios')
      .select('*')
      .eq('notificacion_id', notificacionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (destError) throw destError;
    if (!destinatario) return null;

    const { data: notificacion, error: notError } = await supabase
      .from('notificaciones_internas')
      .select('*')
      .eq('id', notificacionId)
      .single();

    if (notError) throw notError;
    if (!notificacion) return null;

    const { data: replies } = await supabase
      .from('notificacion_respuestas')
      .select('id')
      .eq('notificacion_id', notificacionId);

    return {
      ...notificacion,
      destinatario,
      reply_count: replies?.length || 0,
    };
  }

  async markAsRead(destinatarioId: string, userId: string): Promise<void> {
    console.log('[markAsRead] Marking as read - destinatarioId:', destinatarioId, 'userId:', userId);

    const { error } = await supabase
      .from('notificacion_destinatarios')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', destinatarioId)
      .eq('user_id', userId);

    console.log('[markAsRead] Result:', { error });

    if (error) throw error;
    console.log('[markAsRead] Marked as read successfully');
  }

  async getReplies(notificacionId: string, userId: string): Promise<RespuestaConUsuario[]> {
    console.log('[getReplies] Starting - notificacionId:', notificacionId, 'userId:', userId);

    const { data: destinatario, error: destError } = await supabase
      .from('notificacion_destinatarios')
      .select('id')
      .eq('notificacion_id', notificacionId)
      .eq('user_id', userId)
      .maybeSingle();

    console.log('[getReplies] Destinatario result:', { found: !!destinatario, error: destError });

    if (destError) throw destError;
    if (!destinatario) {
      console.log('[getReplies] No destinatario found - user not authorized');
      return [];
    }

    const { data: replies, error: repliesError } = await supabase
      .from('notificacion_respuestas')
      .select('*')
      .eq('notificacion_id', notificacionId)
      .order('created_at', { ascending: true });

    console.log('[getReplies] Replies result:', { count: replies?.length, error: repliesError });

    if (repliesError) throw repliesError;
    if (!replies || replies.length === 0) {
      console.log('[getReplies] No replies found');
      return [];
    }

    // Fetch user emails from profiles table
    const userIds = [...new Set(replies.map((r) => r.user_id))];
    console.log('[getReplies] Fetching user emails for IDs:', userIds);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    console.log('[getReplies] Profiles result:', { count: profiles?.length, error: profilesError });

    if (profilesError) throw profilesError;

    const userEmailMap = new Map<string, string>();
    profiles?.forEach((profile) => {
      userEmailMap.set(profile.id, profile.email || 'Unknown');
    });

    const repliesWithUsers = replies.map((reply) => ({
      id: reply.id,
      notificacion_id: reply.notificacion_id,
      destinatario_id: reply.destinatario_id,
      user_id: reply.user_id,
      mensaje: reply.mensaje,
      tenant_id: reply.tenant_id,
      created_at: reply.created_at,
      user_email: userEmailMap.get(reply.user_id) || 'Unknown',
    }));

    console.log('[getReplies] Returning replies with user info:', repliesWithUsers.length);
    return repliesWithUsers;
  }

  async createReply(
    notificacionId: string,
    destinatarioId: string,
    userId: string,
    tenantId: string,
    message: string
  ): Promise<NotificacionRespuesta> {
    console.log('[createReply] Starting - notificacionId:', notificacionId, 'userId:', userId);

    const { data, error } = await supabase
      .from('notificacion_respuestas')
      .insert({
        notificacion_id: notificacionId,
        destinatario_id: destinatarioId,
        user_id: userId,
        tenant_id: tenantId,
        message,
      })
      .select()
      .single();

    console.log('[createReply] Result:', { success: !!data, error });

    if (error) throw error;
    console.log('[createReply] Reply created successfully:', data.id);
    return data;
  }

  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notificacion_destinatarios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  subscribeToMensajes(userId: string, tenantId: string, callback: () => void) {
    console.log('[subscribeToMensajes] Setting up subscription - userId:', userId, 'tenantId:', tenantId);

    const channel = supabase
      .channel('mensajes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacion_destinatarios',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[subscribeToMensajes] notificacion_destinatarios change:', payload);
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacion_respuestas',
        },
        (payload) => {
          console.log('[subscribeToMensajes] notificacion_respuestas change:', payload);
          callback();
        }
      )
      .subscribe((status) => {
        console.log('[subscribeToMensajes] Subscription status:', status);
      });

    return channel;
  }
}

export const mensajesService = new MensajesService();

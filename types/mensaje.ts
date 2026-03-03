export interface NotificacionInterna {
  id: string;
  tenant_id: string;
  legajo_id: string;
  afiliado_id: string;
  created_by: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface NotificacionDestinatario {
  id: string;
  notificacion_id: string;
  user_id: string;
  tenant_id: string;
  is_read: boolean;
  read_at: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  status_updated_at: string | null;
  feedback: string | null;
  feedback_at: string | null;
}

export interface NotificacionRespuesta {
  id: string;
  notificacion_id: string;
  destinatario_id: string;
  user_id: string;
  tenant_id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface MensajeCompleto extends NotificacionInterna {
  destinatario: NotificacionDestinatario;
  reply_count?: number;
}

export interface RespuestaConUsuario extends NotificacionRespuesta {
  user_email?: string;
}

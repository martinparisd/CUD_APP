export interface Novedad {
  id: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_by: string;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  modulos_impactados: string[];
  accion_requerida: string;
  fecha_vigencia: string | null;
  criticidad: 'baja' | 'media' | 'alta' | 'critica';
  genera_tarea: boolean;
  tarea_descripcion: string | null;
  author_name: string | null;
  author_avatar: string | null;
  likes_count: number;
  comments_count: number;
}

export interface NovedadLike {
  id: string;
  novedad_id: string;
  user_id: string;
  created_at: string;
}

export interface NovedadComment {
  id: string;
  novedad_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

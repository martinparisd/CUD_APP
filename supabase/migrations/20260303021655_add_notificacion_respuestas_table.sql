/*
  # Add replies table for internal notifications

  1. New Tables
    - `notificacion_respuestas`
      - `id` (uuid, primary key)
      - `notificacion_id` (uuid, foreign key to notificaciones_internas)
      - `destinatario_id` (uuid, foreign key to notificacion_destinatarios)
      - `user_id` (uuid, the user who replied)
      - `tenant_id` (uuid, for multi-tenancy)
      - `message` (text, the reply content)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `notificacion_respuestas` table
    - Add policy for authenticated users to read replies for their notifications
    - Add policy for authenticated users to create replies for notifications they received
    - Add policy for authenticated users to read all replies they created
*/

-- Create the replies table
CREATE TABLE IF NOT EXISTS notificacion_respuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notificacion_id uuid NOT NULL REFERENCES notificaciones_internas(id) ON DELETE CASCADE,
  destinatario_id uuid NOT NULL REFERENCES notificacion_destinatarios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE notificacion_respuestas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read replies for notifications they are a recipient of
CREATE POLICY "Users can read replies for their notifications"
  ON notificacion_respuestas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notificacion_destinatarios nd
      WHERE nd.id = notificacion_respuestas.destinatario_id
      AND nd.user_id = auth.uid()
    )
  );

-- Policy: Users can create replies for notifications they received
CREATE POLICY "Users can create replies for their notifications"
  ON notificacion_respuestas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM notificacion_destinatarios nd
      WHERE nd.id = destinatario_id
      AND nd.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notificacion_respuestas_notificacion_id 
  ON notificacion_respuestas(notificacion_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_respuestas_destinatario_id 
  ON notificacion_respuestas(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_respuestas_user_id 
  ON notificacion_respuestas(user_id);
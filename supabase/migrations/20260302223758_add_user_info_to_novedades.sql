/*
  # Enhance novedades table for Twitter-like feed

  1. Changes
    - Add `author_name` column to cache user display name
    - Add `author_avatar` column for user avatars
    - Add `likes_count` column for tracking likes
    - Add `comments_count` column for tracking comments
    - Create `novedad_likes` table for managing likes
    - Create `novedad_comments` table for comments
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Restrict data access based on user authentication
*/

-- Add new columns to novedades table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'novedades' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE novedades ADD COLUMN author_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'novedades' AND column_name = 'author_avatar'
  ) THEN
    ALTER TABLE novedades ADD COLUMN author_avatar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'novedades' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE novedades ADD COLUMN likes_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'novedades' AND column_name = 'comments_count'
  ) THEN
    ALTER TABLE novedades ADD COLUMN comments_count integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create novedad_likes table
CREATE TABLE IF NOT EXISTS novedad_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(novedad_id, user_id)
);

ALTER TABLE novedad_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON novedad_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON novedad_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON novedad_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create novedad_comments table
CREATE TABLE IF NOT EXISTS novedad_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE novedad_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments"
  ON novedad_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own comments"
  ON novedad_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON novedad_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON novedad_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_novedad_likes_novedad_id ON novedad_likes(novedad_id);
CREATE INDEX IF NOT EXISTS idx_novedad_likes_user_id ON novedad_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_novedad_comments_novedad_id ON novedad_comments(novedad_id);
CREATE INDEX IF NOT EXISTS idx_novedad_comments_user_id ON novedad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_novedades_created_at ON novedades(created_at DESC);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_novedad_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE novedades 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.novedad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE novedades 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.novedad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_novedad_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE novedades 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.novedad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE novedades 
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.novedad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_likes_count ON novedad_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON novedad_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_novedad_likes_count();

DROP TRIGGER IF EXISTS trigger_update_comments_count ON novedad_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON novedad_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_novedad_comments_count();

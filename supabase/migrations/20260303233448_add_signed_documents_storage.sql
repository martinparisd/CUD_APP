/*
  # Add signed documents storage

  1. Modified Tables
    - `docusign_envelopes`
      - Add `signed_pdf_path` (text, nullable) - Storage path to the signed PDF in the signed-documents bucket

  2. Storage
    - Create `signed-documents` bucket (private) for storing signed PDF documents
    - Signed documents require authentication to access

  3. Security
    - Authenticated users can upload signed documents
    - Authenticated users can read signed documents
    - Authenticated users can update signed documents
    - No public access - signed legal documents are private

  4. Notes
    - The signed_pdf_path column stores the storage object path, not a URL
    - Use Supabase signed URLs or authenticated downloads to access files
    - This keeps signed legal documents secure and access-controlled
*/

-- Add signed_pdf_path column to docusign_envelopes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'docusign_envelopes' AND column_name = 'signed_pdf_path'
  ) THEN
    ALTER TABLE docusign_envelopes ADD COLUMN signed_pdf_path text;
  END IF;
END $$;

-- Create private storage bucket for signed documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-documents', 'signed-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload signed documents
CREATE POLICY "Authenticated users can upload signed documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'signed-documents');

-- Allow authenticated users to read signed documents
CREATE POLICY "Authenticated users can read signed documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'signed-documents');

-- Allow authenticated users to update signed documents
CREATE POLICY "Authenticated users can update signed documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'signed-documents');

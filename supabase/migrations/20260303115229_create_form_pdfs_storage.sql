/*
  # Create storage bucket for form PDFs

  1. Storage
    - Create `form-pdfs` bucket for storing generated PDF documents
    - Enable public access for viewing PDFs
    - Set up RLS policies for secure upload/access

  2. Security
    - Authenticated users can upload PDFs
    - Anyone can view PDFs (public bucket for sharing)
*/

-- Create storage bucket for form PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-pdfs', 'form-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated users can upload form PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'form-pdfs');

-- Allow authenticated users to update their PDFs
CREATE POLICY "Authenticated users can update form PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'form-pdfs');

-- Allow public read access to PDFs
CREATE POLICY "Public can view form PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'form-pdfs');

-- Allow authenticated users to delete PDFs
CREATE POLICY "Authenticated users can delete form PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'form-pdfs');

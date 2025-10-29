-- Ensure the spm-documents bucket is public for SP2D documents
UPDATE storage.buckets 
SET public = true 
WHERE id = 'spm-documents';

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Authenticated users can view SP2D documents" ON storage.objects;

-- Add RLS policy to allow reading SP2D documents for authenticated users
CREATE POLICY "Authenticated users can view SP2D documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'spm-documents' 
  AND (storage.foldername(name))[1] = 'sp2d-documents'
);
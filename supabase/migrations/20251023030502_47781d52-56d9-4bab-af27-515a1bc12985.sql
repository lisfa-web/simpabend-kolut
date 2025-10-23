-- Create storage bucket for SPM documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('spm-documents', 'spm-documents', false);

-- RLS Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own SPM documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'spm-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can read SPM documents they have access to
CREATE POLICY "Users can read accessible SPM documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'spm-documents' AND
  (
    -- Bendahara can read their own SPM documents
    (storage.foldername(name))[1] = auth.uid()::text
    -- Or user has roles that can access SPM documents
    OR has_role(auth.uid(), 'resepsionis')
    OR has_role(auth.uid(), 'pbmd')
    OR has_role(auth.uid(), 'akuntansi')
    OR has_role(auth.uid(), 'perbendaharaan')
    OR has_role(auth.uid(), 'kepala_bkad')
    OR has_role(auth.uid(), 'kuasa_bud')
    OR is_admin(auth.uid())
  )
);

-- RLS Policy: Users can delete their own SPM documents (only if SPM is still draft)
CREATE POLICY "Users can delete own draft SPM documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'spm-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
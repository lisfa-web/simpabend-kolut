-- Add RLS policies for SP2D document uploads in spm-documents bucket

-- Policy for Kuasa BUD to upload SP2D documents
CREATE POLICY "Kuasa BUD can upload SP2D documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'spm-documents' 
  AND (storage.foldername(name))[1] = 'sp2d-documents'
  AND (
    public.has_role(auth.uid(), 'kuasa_bud'::public.app_role) 
    OR public.is_admin(auth.uid())
  )
);

-- Policy for authorized users to read SP2D documents
CREATE POLICY "Authorized users can view SP2D documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'spm-documents' 
  AND (storage.foldername(name))[1] = 'sp2d-documents'
  AND (
    public.has_role(auth.uid(), 'kuasa_bud'::public.app_role)
    OR public.has_role(auth.uid(), 'kepala_bkad'::public.app_role)
    OR public.has_role(auth.uid(), 'bendahara_opd'::public.app_role)
    OR public.is_admin(auth.uid())
  )
);
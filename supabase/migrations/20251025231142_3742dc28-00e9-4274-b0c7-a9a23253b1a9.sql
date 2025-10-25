-- Add kop_surat_url column to template_surat table
ALTER TABLE public.template_surat 
ADD COLUMN kop_surat_url TEXT;

COMMENT ON COLUMN public.template_surat.kop_surat_url IS 'URL file kop surat yang diupload ke storage';

-- Create storage bucket for kop surat
INSERT INTO storage.buckets (id, name, public)
VALUES ('kop-surat', 'kop-surat', true);

-- RLS Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated can upload kop surat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kop-surat');

-- RLS Policy: Allow public read
CREATE POLICY "Public can view kop surat"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kop-surat');

-- RLS Policy: Admins can delete
CREATE POLICY "Admins can delete kop surat"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kop-surat' AND is_admin(auth.uid()));
-- Create storage bucket for pejabat signatures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ttd-pejabat', 'ttd-pejabat', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for ttd-pejabat bucket
CREATE POLICY "Public can view signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'ttd-pejabat');

CREATE POLICY "Admins can upload signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ttd-pejabat' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('administrator', 'kepala_bkad')
    )
  )
);

CREATE POLICY "Admins can update signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ttd-pejabat'
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('administrator', 'kepala_bkad')
    )
  )
);

CREATE POLICY "Admins can delete signatures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ttd-pejabat'
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('administrator', 'kepala_bkad')
    )
  )
);
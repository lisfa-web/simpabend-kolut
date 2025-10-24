-- Create storage bucket for system logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system-logos',
  'system-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for system-logos bucket
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'system-logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'system-logos' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'administrator'
  )
);

CREATE POLICY "Admins can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'system-logos'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'administrator'
  )
);

CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'system-logos'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'administrator'
  )
);

-- Insert default config for logo
INSERT INTO config_sistem (key, value, description)
VALUES (
  'logo_bkad_url',
  '',
  'URL logo BKAD Kolaka Utara untuk landing page'
) ON CONFLICT (key) DO NOTHING;
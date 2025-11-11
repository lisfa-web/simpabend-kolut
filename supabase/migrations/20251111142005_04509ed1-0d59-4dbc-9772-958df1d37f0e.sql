-- Create table for setting access control
CREATE TABLE public.setting_access_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_title text NOT NULL,
  superadmin_only boolean DEFAULT false,
  is_configurable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed initial data
INSERT INTO public.setting_access_control (setting_key, setting_title, superadmin_only, is_configurable) VALUES
  ('database-backup', 'Database Backup', true, true),
  ('emergency-mode', 'Mode Emergency', false, true),
  ('sidebar-template', 'Template Sidebar', true, true),
  ('security', 'Keamanan Session', false, true),
  ('config', 'Konfigurasi Sistem', false, true),
  ('format-nomor', 'Format Nomor', false, true),
  ('wa-gateway', 'WhatsApp Gateway', true, true),
  ('email', 'Email Configuration', true, true),
  ('permissions', 'Hak Akses', false, true),
  ('access-control', 'Kontrol Akses Pengaturan', true, false);

-- Enable RLS
ALTER TABLE public.setting_access_control ENABLE ROW LEVEL SECURITY;

-- Policy: Only superadmin can manage
CREATE POLICY "Superadmin can manage access control"
ON public.setting_access_control
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_setting_access_control_updated_at
BEFORE UPDATE ON public.setting_access_control
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add emergency mode configuration
INSERT INTO public.config_sistem (key, value, description) VALUES 
('emergency_mode_enabled', 'false', 'Aktifkan bypass OTP/PIN untuk situasi darurat'),
('emergency_mode_activated_at', '', 'Timestamp aktivasi mode emergency'),
('emergency_mode_activated_by', '', 'User ID yang mengaktifkan mode emergency'),
('emergency_mode_reason', '', 'Alasan aktivasi mode emergency')
ON CONFLICT (key) DO NOTHING;

-- Add emergency tracking columns to audit_log
ALTER TABLE public.audit_log 
ADD COLUMN IF NOT EXISTS is_emergency boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_reason text;

-- RLS policy for emergency mode config (only super_admin can manage)
CREATE POLICY "Super admin can manage emergency mode"
ON public.config_sistem
FOR UPDATE
USING (
  key LIKE 'emergency_mode%' 
  AND has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  key LIKE 'emergency_mode%' 
  AND has_role(auth.uid(), 'super_admin'::app_role)
);
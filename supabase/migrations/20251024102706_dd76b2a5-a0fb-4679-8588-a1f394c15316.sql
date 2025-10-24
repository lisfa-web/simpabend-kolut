-- Add unique constraints for critical master data
ALTER TABLE public.program ADD CONSTRAINT unique_program_code_year UNIQUE (kode_program, tahun_anggaran);
ALTER TABLE public.opd ADD CONSTRAINT unique_opd_code UNIQUE (kode_opd);
ALTER TABLE public.kegiatan ADD CONSTRAINT unique_kegiatan_code_program UNIQUE (kode_kegiatan, program_id);
ALTER TABLE public.subkegiatan ADD CONSTRAINT unique_subkegiatan_code_kegiatan UNIQUE (kode_subkegiatan, kegiatan_id);
ALTER TABLE public.vendor ADD CONSTRAINT unique_vendor_npwp UNIQUE (npwp);

-- Add indexes for performance on is_active column
CREATE INDEX IF NOT EXISTS idx_program_is_active ON public.program(is_active);
CREATE INDEX IF NOT EXISTS idx_opd_is_active ON public.opd(is_active);
CREATE INDEX IF NOT EXISTS idx_kegiatan_is_active ON public.kegiatan(is_active);
CREATE INDEX IF NOT EXISTS idx_subkegiatan_is_active ON public.subkegiatan(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_is_active ON public.vendor(is_active);

-- Update RLS policies to allow Akuntansi role to manage master data
-- Program policies
DROP POLICY IF EXISTS "Admins can manage program" ON public.program;
CREATE POLICY "Admins and Akuntansi can manage program" ON public.program
  FOR ALL USING (
    is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
  );

-- OPD policies
DROP POLICY IF EXISTS "Admins can manage OPD" ON public.opd;
CREATE POLICY "Admins and Akuntansi can manage OPD" ON public.opd
  FOR ALL USING (
    is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
  );

-- Kegiatan policies
DROP POLICY IF EXISTS "Admins can manage kegiatan" ON public.kegiatan;
CREATE POLICY "Admins and Akuntansi can manage kegiatan" ON public.kegiatan
  FOR ALL USING (
    is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
  );

-- Subkegiatan policies
DROP POLICY IF EXISTS "Admins can manage subkegiatan" ON public.subkegiatan;
CREATE POLICY "Admins and Akuntansi can manage subkegiatan" ON public.subkegiatan
  FOR ALL USING (
    is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
  );

-- Vendor policies
DROP POLICY IF EXISTS "Admins can manage vendor" ON public.vendor;
CREATE POLICY "Admins and Akuntansi can manage vendor" ON public.vendor
  FOR ALL USING (
    is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
  );

-- Function to check program dependencies
CREATE OR REPLACE FUNCTION public.check_program_dependencies(program_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kegiatan_count integer;
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO kegiatan_count
  FROM public.kegiatan
  WHERE program_id = program_id_param AND is_active = true;
  
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE program_id = program_id_param;
  
  result := jsonb_build_object(
    'kegiatan_count', kegiatan_count,
    'spm_count', spm_count,
    'can_deactivate', (kegiatan_count = 0 AND spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function to check OPD dependencies
CREATE OR REPLACE FUNCTION public.check_opd_dependencies(opd_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  spm_count integer;
  pejabat_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM public.user_roles
  WHERE opd_id = opd_id_param;
  
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE opd_id = opd_id_param;
  
  SELECT COUNT(*) INTO pejabat_count
  FROM public.pejabat
  WHERE opd_id = opd_id_param AND is_active = true;
  
  result := jsonb_build_object(
    'user_count', user_count,
    'spm_count', spm_count,
    'pejabat_count', pejabat_count,
    'can_deactivate', (user_count = 0 AND spm_count = 0 AND pejabat_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function to check kegiatan dependencies
CREATE OR REPLACE FUNCTION public.check_kegiatan_dependencies(kegiatan_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subkegiatan_count integer;
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO subkegiatan_count
  FROM public.subkegiatan
  WHERE kegiatan_id = kegiatan_id_param AND is_active = true;
  
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE kegiatan_id = kegiatan_id_param;
  
  result := jsonb_build_object(
    'subkegiatan_count', subkegiatan_count,
    'spm_count', spm_count,
    'can_deactivate', (subkegiatan_count = 0 AND spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function to check subkegiatan dependencies
CREATE OR REPLACE FUNCTION public.check_subkegiatan_dependencies(subkegiatan_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE subkegiatan_id = subkegiatan_id_param;
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'can_deactivate', (spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function to check vendor dependencies
CREATE OR REPLACE FUNCTION public.check_vendor_dependencies(vendor_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE vendor_id = vendor_id_param;
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'can_deactivate', (spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Add triggers for audit trail on master data changes
CREATE OR REPLACE FUNCTION public.audit_master_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
  END IF;

  INSERT INTO public.audit_log (
    user_id,
    action,
    resource,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    _user_id,
    _action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to critical master data tables
DROP TRIGGER IF EXISTS audit_program_changes ON public.program;
CREATE TRIGGER audit_program_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.program
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();

DROP TRIGGER IF EXISTS audit_opd_changes ON public.opd;
CREATE TRIGGER audit_opd_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.opd
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();

DROP TRIGGER IF EXISTS audit_kegiatan_changes ON public.kegiatan;
CREATE TRIGGER audit_kegiatan_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.kegiatan
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();

DROP TRIGGER IF EXISTS audit_subkegiatan_changes ON public.subkegiatan;
CREATE TRIGGER audit_subkegiatan_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.subkegiatan
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();

DROP TRIGGER IF EXISTS audit_vendor_changes ON public.vendor;
CREATE TRIGGER audit_vendor_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();
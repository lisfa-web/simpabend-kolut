-- Add verified_by columns to spm table
ALTER TABLE public.spm
ADD COLUMN verified_by_resepsionis uuid REFERENCES public.profiles(id),
ADD COLUMN verified_by_pbmd uuid REFERENCES public.profiles(id),
ADD COLUMN verified_by_akuntansi uuid REFERENCES public.profiles(id),
ADD COLUMN verified_by_perbendaharaan uuid REFERENCES public.profiles(id);

-- Add tracking columns to sp2d table
ALTER TABLE public.sp2d
ADD COLUMN created_by uuid REFERENCES public.profiles(id),
ADD COLUMN verified_by uuid REFERENCES public.profiles(id);

-- Create audit trigger function for spm
CREATE OR REPLACE FUNCTION public.audit_spm_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
    _user_id := NEW.bendahara_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
    -- Determine which user made the change based on status change
    IF (OLD.status != NEW.status) THEN
      CASE NEW.status
        WHEN 'resepsionis_verifikasi' THEN _user_id := NEW.verified_by_resepsionis;
        WHEN 'pbmd_verifikasi' THEN _user_id := NEW.verified_by_pbmd;
        WHEN 'akuntansi_validasi' THEN _user_id := NEW.verified_by_akuntansi;
        WHEN 'perbendaharaan_verifikasi' THEN _user_id := NEW.verified_by_perbendaharaan;
        WHEN 'kepala_bkad_review', 'disetujui' THEN _user_id := NEW.verified_by_kepala_bkad;
        ELSE _user_id := NEW.bendahara_id;
      END CASE;
    ELSE
      _user_id := NEW.bendahara_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
    _user_id := OLD.bendahara_id;
  END IF;

  -- Insert audit log
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
    'spm',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit trigger function for sp2d
CREATE OR REPLACE FUNCTION public.audit_sp2d_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
    _user_id := NEW.created_by;
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
    -- If status changed to approved/rejected, user is the verifier
    IF (OLD.status != NEW.status AND NEW.status IN ('disetujui', 'ditolak')) THEN
      _user_id := NEW.verified_by;
    ELSE
      _user_id := COALESCE(NEW.verified_by, NEW.created_by);
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
    _user_id := OLD.created_by;
  END IF;

  -- Insert audit log
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
    'sp2d',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for spm
DROP TRIGGER IF EXISTS trigger_audit_spm ON public.spm;
CREATE TRIGGER trigger_audit_spm
  AFTER INSERT OR UPDATE OR DELETE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_spm_changes();

-- Create triggers for sp2d
DROP TRIGGER IF EXISTS trigger_audit_sp2d ON public.sp2d;
CREATE TRIGGER trigger_audit_sp2d
  AFTER INSERT OR UPDATE OR DELETE ON public.sp2d
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sp2d_changes();

-- Add comment for documentation
COMMENT ON FUNCTION public.audit_spm_changes() IS 'Automatically logs all changes to spm table into audit_log';
COMMENT ON FUNCTION public.audit_sp2d_changes() IS 'Automatically logs all changes to sp2d table into audit_log';
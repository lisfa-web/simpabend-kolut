-- Add dependency check function for pejabat
CREATE OR REPLACE FUNCTION public.check_pejabat_dependencies(pejabat_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  surat_count integer;
  result jsonb;
BEGIN
  -- Check if pejabat is used in template_surat or any generated letters
  -- For now we'll just prepare for future use
  surat_count := 0;
  
  result := jsonb_build_object(
    'surat_count', surat_count,
    'can_deactivate', (surat_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Add audit trigger for pejabat
DROP TRIGGER IF EXISTS audit_pejabat_changes ON public.pejabat;
CREATE TRIGGER audit_pejabat_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pejabat
  FOR EACH ROW EXECUTE FUNCTION public.audit_master_data_changes();
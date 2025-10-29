-- Clean up obsolete database functions related to dropped tables

-- Drop functions that check dependencies for dropped tables
DROP FUNCTION IF EXISTS public.check_program_dependencies(uuid);
DROP FUNCTION IF EXISTS public.check_kegiatan_dependencies(uuid);
DROP FUNCTION IF EXISTS public.check_subkegiatan_dependencies(uuid);
DROP FUNCTION IF EXISTS public.check_pejabat_dependencies(uuid);

-- Create new function to check jenis_spm dependencies
CREATE OR REPLACE FUNCTION public.check_jenis_spm_dependencies(jenis_spm_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE jenis_spm_id = jenis_spm_id_param;
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'can_deactivate', (spm_count = 0)
  );
  
  RETURN result;
END;
$$;
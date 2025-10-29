-- Update assign_spm_number trigger to NOT generate nomor if already provided manually
CREATE OR REPLACE FUNCTION public.assign_spm_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only assign number if status is 'diajukan' and nomor_spm is NULL or empty
  -- This allows manual nomor_spm to be preserved
  IF NEW.status = 'diajukan' AND (NEW.nomor_spm IS NULL OR NEW.nomor_spm = '') THEN
    NEW.nomor_spm := generate_document_number('spm', COALESCE(NEW.tanggal_ajuan, now()));
  END IF;
  
  RETURN NEW;
END;
$function$;
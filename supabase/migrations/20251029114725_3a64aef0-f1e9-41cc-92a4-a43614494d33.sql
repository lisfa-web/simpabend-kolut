-- Drop the FK constraint that caused ambiguity
ALTER TABLE public.spm
DROP CONSTRAINT IF EXISTS fk_spm_jenis_spm;
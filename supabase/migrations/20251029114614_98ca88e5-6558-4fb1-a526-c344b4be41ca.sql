-- Add FK constraint for jenis_spm_id to ensure data integrity
ALTER TABLE public.spm
ADD CONSTRAINT fk_spm_jenis_spm
FOREIGN KEY (jenis_spm_id) 
REFERENCES public.jenis_spm(id)
ON DELETE SET NULL;
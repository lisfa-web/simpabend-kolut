-- Fix bendahara_id foreign key to reference public.profiles(id)
ALTER TABLE public.spm
DROP CONSTRAINT IF EXISTS spm_bendahara_id_fkey;

ALTER TABLE public.spm
ADD CONSTRAINT spm_bendahara_id_fkey
FOREIGN KEY (bendahara_id)
REFERENCES public.profiles(id)
ON DELETE RESTRICT;
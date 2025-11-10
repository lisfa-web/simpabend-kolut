-- Increase nomor_spm character limit from 50 to 65
ALTER TABLE public.spm 
ALTER COLUMN nomor_spm TYPE character varying(65);
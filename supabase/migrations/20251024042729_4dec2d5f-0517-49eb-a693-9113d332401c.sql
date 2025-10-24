-- Ensure required foreign key relationships exist for SPM joins used in reports
-- Profiles relationships (verifiers and bendahara)
ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_bendahara_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_bendahara_id_fkey FOREIGN KEY (bendahara_id)
  REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_verified_by_resepsionis_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_verified_by_resepsionis_fkey FOREIGN KEY (verified_by_resepsionis)
  REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_verified_by_pbmd_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_verified_by_pbmd_fkey FOREIGN KEY (verified_by_pbmd)
  REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_verified_by_akuntansi_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_verified_by_akuntansi_fkey FOREIGN KEY (verified_by_akuntansi)
  REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_verified_by_perbendaharaan_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_verified_by_perbendaharaan_fkey FOREIGN KEY (verified_by_perbendaharaan)
  REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_verified_by_kepala_bkad_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_verified_by_kepala_bkad_fkey FOREIGN KEY (verified_by_kepala_bkad)
  REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Master data relationships
ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_opd_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_opd_id_fkey FOREIGN KEY (opd_id)
  REFERENCES public.opd(id) ON DELETE RESTRICT;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_program_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_program_id_fkey FOREIGN KEY (program_id)
  REFERENCES public.program(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_kegiatan_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_kegiatan_id_fkey FOREIGN KEY (kegiatan_id)
  REFERENCES public.kegiatan(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_subkegiatan_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_subkegiatan_id_fkey FOREIGN KEY (subkegiatan_id)
  REFERENCES public.subkegiatan(id) ON DELETE SET NULL;

ALTER TABLE public.spm DROP CONSTRAINT IF EXISTS spm_vendor_id_fkey;
ALTER TABLE public.spm ADD CONSTRAINT spm_vendor_id_fkey FOREIGN KEY (vendor_id)
  REFERENCES public.vendor(id) ON DELETE SET NULL;
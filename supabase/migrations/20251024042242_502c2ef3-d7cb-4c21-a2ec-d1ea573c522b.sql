-- Drop policy lama
DROP POLICY IF EXISTS "Users can view related SPM" ON spm;

-- Buat policy baru yang lebih fleksibel untuk laporan
CREATE POLICY "Users can view SPM for reports"
ON spm
FOR SELECT
TO authenticated
USING (
  -- Bendahara bisa lihat SPM sendiri
  auth.uid() = bendahara_id OR
  -- Semua verifier bisa lihat semua SPM
  has_role(auth.uid(), 'resepsionis'::app_role) OR
  has_role(auth.uid(), 'pbmd'::app_role) OR
  has_role(auth.uid(), 'akuntansi'::app_role) OR
  has_role(auth.uid(), 'perbendaharaan'::app_role) OR
  has_role(auth.uid(), 'kepala_bkad'::app_role) OR
  has_role(auth.uid(), 'kuasa_bud'::app_role) OR
  -- Admin bisa lihat semua
  is_admin(auth.uid()) OR
  -- Bendahara OPD bisa lihat semua SPM dari OPD mereka
  (
    has_role(auth.uid(), 'bendahara_opd'::app_role) AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.opd_id = spm.opd_id
    )
  )
);
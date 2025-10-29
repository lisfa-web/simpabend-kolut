-- Drop ALL custom triggers on spm table
DROP TRIGGER IF EXISTS trigger_assign_spm_number_insert ON spm;
DROP TRIGGER IF EXISTS trigger_assign_spm_number_update ON spm;
DROP TRIGGER IF EXISTS trigger_assign_verification_numbers ON spm;
DROP TRIGGER IF EXISTS trigger_audit_spm ON spm;
DROP TRIGGER IF EXISTS trigger_update_spm_nilai_bersih ON spm;
DROP TRIGGER IF EXISTS update_spm_updated_at ON spm;
DROP TRIGGER IF EXISTS assign_spm_number_trigger ON spm;
DROP TRIGGER IF EXISTS assign_verification_numbers_trigger ON spm;

-- Drop policies that depend on status column
DROP POLICY IF EXISTS "Authorized users can update SPM" ON spm;
DROP POLICY IF EXISTS "Bendahara can create own SPM" ON spm;
DROP POLICY IF EXISTS "Bendahara can manage own draft SPM tax deductions" ON potongan_pajak_spm;

-- 1. Update tabel spm: ganti vendor dengan penerima
ALTER TABLE spm DROP COLUMN IF EXISTS vendor_id;
ALTER TABLE spm ADD COLUMN IF NOT EXISTS tipe_penerima text CHECK (tipe_penerima IN ('bendahara_pengeluaran', 'vendor', 'pihak_ketiga'));
ALTER TABLE spm ADD COLUMN IF NOT EXISTS nama_penerima text;

-- 2. Update tabel pajak_per_jenis_spm
ALTER TABLE pajak_per_jenis_spm DROP COLUMN IF EXISTS kategori;
ALTER TABLE pajak_per_jenis_spm DROP COLUMN IF EXISTS tarif_khusus;
ALTER TABLE pajak_per_jenis_spm ADD COLUMN IF NOT EXISTS deskripsi text;

-- 3. Update enum status_spm
UPDATE spm SET status = 'perlu_revisi' WHERE status = 'ditolak';
ALTER TABLE spm ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS status_spm CASCADE;
CREATE TYPE status_spm AS ENUM (
  'draft',
  'diajukan',
  'resepsionis_verifikasi',
  'pbmd_verifikasi',
  'akuntansi_validasi',
  'perbendaharaan_verifikasi',
  'kepala_bkad_review',
  'disetujui',
  'perlu_revisi'
);
ALTER TABLE spm ALTER COLUMN status TYPE status_spm USING status::status_spm;

-- Recreate triggers
CREATE TRIGGER trigger_assign_spm_number_insert
  BEFORE INSERT ON spm
  FOR EACH ROW
  EXECUTE FUNCTION assign_spm_number();

CREATE TRIGGER trigger_assign_spm_number_update
  BEFORE UPDATE ON spm
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'diajukan')
  EXECUTE FUNCTION assign_spm_number();

CREATE TRIGGER trigger_assign_verification_numbers
  BEFORE UPDATE ON spm
  FOR EACH ROW
  WHEN (OLD.status = 'diajukan' AND NEW.status = 'resepsionis_verifikasi')
  EXECUTE FUNCTION assign_verification_numbers();

CREATE TRIGGER trigger_audit_spm
  AFTER INSERT OR UPDATE OR DELETE ON spm
  FOR EACH ROW
  EXECUTE FUNCTION audit_spm_changes();

CREATE TRIGGER trigger_update_spm_nilai_bersih
  BEFORE INSERT OR UPDATE ON spm
  FOR EACH ROW
  EXECUTE FUNCTION update_spm_nilai_bersih();

CREATE TRIGGER update_spm_updated_at
  BEFORE UPDATE ON spm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate RLS policies
CREATE POLICY "Authorized users can update SPM"
  ON spm FOR UPDATE
  USING (
    (auth.uid() = bendahara_id AND status = 'draft'::status_spm)
    OR has_role(auth.uid(), 'resepsionis'::app_role)
    OR has_role(auth.uid(), 'pbmd'::app_role)
    OR has_role(auth.uid(), 'akuntansi'::app_role)
    OR has_role(auth.uid(), 'perbendaharaan'::app_role)
    OR has_role(auth.uid(), 'kepala_bkad'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "Bendahara can create own SPM"
  ON spm FOR INSERT
  WITH CHECK (
    (auth.uid() = bendahara_id AND has_role(auth.uid(), 'bendahara_opd'::app_role))
    OR is_admin(auth.uid())
  );

CREATE POLICY "Bendahara can manage own draft SPM tax deductions"
  ON potongan_pajak_spm
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM spm
      WHERE spm.id = potongan_pajak_spm.spm_id
      AND auth.uid() = spm.bendahara_id
      AND spm.status = 'draft'::status_spm
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spm
      WHERE spm.id = potongan_pajak_spm.spm_id
      AND auth.uid() = spm.bendahara_id
      AND spm.status = 'draft'::status_spm
    )
  );

-- 4. Nonaktifkan vendor
UPDATE vendor SET is_active = false WHERE is_active = true;
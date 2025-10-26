-- ===========================
-- FASE 1: Database Schema Changes
-- Implementasi Perhitungan Pajak di SPM
-- ===========================

-- 1. Buat tabel potongan_pajak_spm
CREATE TABLE IF NOT EXISTS potongan_pajak_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID NOT NULL REFERENCES spm(id) ON DELETE CASCADE,
  jenis_pajak TEXT NOT NULL CHECK (jenis_pajak IN ('pph_21', 'pph_22', 'pph_23', 'pph_4_ayat_2', 'ppn')),
  rekening_pajak TEXT,
  uraian TEXT NOT NULL,
  tarif NUMERIC(5,2) NOT NULL CHECK (tarif >= 0 AND tarif <= 100),
  dasar_pengenaan BIGINT NOT NULL CHECK (dasar_pengenaan > 0),
  jumlah_pajak BIGINT NOT NULL CHECK (jumlah_pajak >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_potongan_pajak_spm_spm_id ON potongan_pajak_spm(spm_id);

-- 2. Tambah kolom di tabel spm
ALTER TABLE spm 
ADD COLUMN IF NOT EXISTS total_potongan BIGINT DEFAULT 0 CHECK (total_potongan >= 0),
ADD COLUMN IF NOT EXISTS nilai_bersih BIGINT;

-- 3. Trigger untuk auto-calculate total_potongan dan nilai_bersih
CREATE OR REPLACE FUNCTION recalculate_spm_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE spm
  SET 
    total_potongan = (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM potongan_pajak_spm
      WHERE spm_id = COALESCE(NEW.spm_id, OLD.spm_id)
    ),
    nilai_bersih = nilai_spm - (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM potongan_pajak_spm
      WHERE spm_id = COALESCE(NEW.spm_id, OLD.spm_id)
    )
  WHERE id = COALESCE(NEW.spm_id, OLD.spm_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS trigger_recalculate_spm_totals ON potongan_pajak_spm;

-- Buat trigger
CREATE TRIGGER trigger_recalculate_spm_totals
AFTER INSERT OR UPDATE OR DELETE ON potongan_pajak_spm
FOR EACH ROW EXECUTE FUNCTION recalculate_spm_totals();

-- 4. Trigger untuk update nilai_bersih saat nilai_spm berubah
CREATE OR REPLACE FUNCTION update_spm_nilai_bersih()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nilai_bersih = NEW.nilai_spm - COALESCE(NEW.total_potongan, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_spm_nilai_bersih ON spm;

CREATE TRIGGER trigger_update_spm_nilai_bersih
BEFORE INSERT OR UPDATE OF nilai_spm, total_potongan ON spm
FOR EACH ROW EXECUTE FUNCTION update_spm_nilai_bersih();

-- 5. Update nilai_bersih untuk data existing
UPDATE spm
SET nilai_bersih = nilai_spm - COALESCE(total_potongan, 0)
WHERE nilai_bersih IS NULL;

-- 6. RLS Policies untuk potongan_pajak_spm
ALTER TABLE potongan_pajak_spm ENABLE ROW LEVEL SECURITY;

-- Bendahara dan verifikator dapat melihat
CREATE POLICY "Users can view SPM tax deductions"
ON potongan_pajak_spm FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM spm
    WHERE spm.id = potongan_pajak_spm.spm_id
    AND (
      auth.uid() = spm.bendahara_id OR
      has_role(auth.uid(), 'resepsionis') OR
      has_role(auth.uid(), 'pbmd') OR
      has_role(auth.uid(), 'akuntansi') OR
      has_role(auth.uid(), 'perbendaharaan') OR
      has_role(auth.uid(), 'kepala_bkad') OR
      has_role(auth.uid(), 'kuasa_bud') OR
      is_admin(auth.uid())
    )
  )
);

-- Bendahara dapat manage pajak pada SPM draft-nya
CREATE POLICY "Bendahara can manage own draft SPM tax deductions"
ON potongan_pajak_spm FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM spm
    WHERE spm.id = potongan_pajak_spm.spm_id
    AND auth.uid() = spm.bendahara_id
    AND spm.status = 'draft'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM spm
    WHERE spm.id = potongan_pajak_spm.spm_id
    AND auth.uid() = spm.bendahara_id
    AND spm.status = 'draft'
  )
);

-- Admin dapat manage semua
CREATE POLICY "Admins can manage all tax deductions"
ON potongan_pajak_spm FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 7. Migration data existing (copy pajak dari SP2D ke SPM jika ada)
-- Hanya untuk data dummy yang mungkin sudah ada
INSERT INTO potongan_pajak_spm (spm_id, jenis_pajak, rekening_pajak, uraian, tarif, dasar_pengenaan, jumlah_pajak)
SELECT 
  sp2d.spm_id,
  p.jenis_pajak,
  p.rekening_pajak,
  p.uraian,
  p.tarif,
  p.dasar_pengenaan,
  p.jumlah_pajak
FROM potongan_pajak_sp2d p
JOIN sp2d ON sp2d.id = p.sp2d_id
WHERE NOT EXISTS (
  SELECT 1 FROM potongan_pajak_spm 
  WHERE spm_id = sp2d.spm_id
)
ON CONFLICT DO NOTHING;

-- Update total_potongan untuk SPM yang sudah punya pajak
UPDATE spm
SET total_potongan = COALESCE((
  SELECT SUM(jumlah_pajak)
  FROM potongan_pajak_spm
  WHERE spm_id = spm.id
), 0)
WHERE EXISTS (
  SELECT 1 FROM potongan_pajak_spm WHERE spm_id = spm.id
);
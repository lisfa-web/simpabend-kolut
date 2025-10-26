-- Create master_pajak table
CREATE TABLE public.master_pajak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_pajak VARCHAR(50) NOT NULL UNIQUE,
  nama_pajak TEXT NOT NULL,
  jenis_pajak VARCHAR(20) NOT NULL CHECK (jenis_pajak IN ('pph_21', 'pph_22', 'pph_23', 'pph_4_ayat_2', 'ppn')),
  rekening_pajak VARCHAR(100) NOT NULL,
  tarif_default NUMERIC(5,2) NOT NULL CHECK (tarif_default >= 0 AND tarif_default <= 100),
  deskripsi TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pajak_per_jenis_spm table
CREATE TABLE public.pajak_per_jenis_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_spm TEXT NOT NULL,
  master_pajak_id UUID NOT NULL REFERENCES master_pajak(id) ON DELETE CASCADE,
  tarif_khusus NUMERIC(5,2),
  uraian_template TEXT,
  is_default BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_pajak_per_spm UNIQUE(jenis_spm, master_pajak_id)
);

-- Create indexes
CREATE INDEX idx_master_pajak_jenis ON master_pajak(jenis_pajak);
CREATE INDEX idx_master_pajak_active ON master_pajak(is_active);
CREATE INDEX idx_pajak_per_jenis_spm ON pajak_per_jenis_spm(jenis_spm);
CREATE INDEX idx_pajak_per_master ON pajak_per_jenis_spm(master_pajak_id);

-- Add update triggers
CREATE TRIGGER update_master_pajak_updated_at
  BEFORE UPDATE ON master_pajak
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pajak_per_jenis_spm_updated_at
  BEFORE UPDATE ON pajak_per_jenis_spm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add audit trigger for master_pajak
CREATE TRIGGER audit_master_pajak_changes
  AFTER INSERT OR UPDATE OR DELETE ON master_pajak
  FOR EACH ROW
  EXECUTE FUNCTION audit_master_data_changes();

-- Create dependency check function
CREATE OR REPLACE FUNCTION check_pajak_dependencies(pajak_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spm_count INTEGER;
  sp2d_count INTEGER;
  result JSONB;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM potongan_pajak_spm
  WHERE jenis_pajak = (SELECT jenis_pajak FROM master_pajak WHERE id = pajak_id_param);
  
  SELECT COUNT(*) INTO sp2d_count
  FROM potongan_pajak_sp2d
  WHERE jenis_pajak::text = (SELECT jenis_pajak FROM master_pajak WHERE id = pajak_id_param);
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'sp2d_count', sp2d_count,
    'can_deactivate', (spm_count = 0 AND sp2d_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Enable RLS
ALTER TABLE master_pajak ENABLE ROW LEVEL SECURITY;
ALTER TABLE pajak_per_jenis_spm ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_pajak
CREATE POLICY "All authenticated can read master_pajak"
  ON master_pajak FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and Akuntansi can create master_pajak"
  ON master_pajak FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Admins and Akuntansi can update master_pajak"
  ON master_pajak FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Only super admin can delete master_pajak"
  ON master_pajak FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for pajak_per_jenis_spm
CREATE POLICY "All authenticated can read pajak_per_jenis_spm"
  ON pajak_per_jenis_spm FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage pajak_per_jenis_spm"
  ON pajak_per_jenis_spm FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insert Master Pajak data
INSERT INTO master_pajak (kode_pajak, nama_pajak, jenis_pajak, rekening_pajak, tarif_default, deskripsi) VALUES
('PPH21-01', 'PPh Pasal 21', 'pph_21', '4.1.01.01.01.0001', 5.00, 'Potongan gaji/honorarium pegawai, narasumber, panitia kegiatan'),
('PPH22-01', 'PPh Pasal 22', 'pph_22', '4.1.01.02.01.0001', 1.50, 'Bendahara sebagai pemungut pajak atas pembelian barang tertentu dari rekanan non-ritel'),
('PPH23-01', 'PPh Pasal 23', 'pph_23', '4.1.01.03.01.0001', 2.00, 'Dikenakan atas jasa konsultan, penyedia jasa lainnya'),
('PPH42-01', 'PPh Pasal 4 Ayat 2 - Jasa Konstruksi', 'pph_4_ayat_2', '4.1.01.04.01.0001', 2.00, 'Pajak final sesuai tarif PP 9 Tahun 2022 untuk jasa konstruksi'),
('PPH42-02', 'PPh Pasal 4 Ayat 2 - Sewa Tanah/Bangunan', 'pph_4_ayat_2', '4.1.01.04.02.0001', 10.00, 'Pajak final untuk sewa tanah dan/atau bangunan'),
('PPN-01', 'PPN 11%', 'ppn', '4.1.02.01.01.0001', 11.00, 'Dipungut oleh bendahara dari rekanan Pengusaha Kena Pajak (PKP)');

-- Insert mappings to SPM types
INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_gaji', id, 'Potongan PPh 21 atas Gaji Pegawai', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH21-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_honorarium', id, 'Potongan PPh 21 atas Honorarium', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH21-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_barang', id, 'Potongan PPh 22 atas Pembelian Barang', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH22-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_barang', id, 'Potongan PPN atas Pembelian Barang dari PKP', false, 2
FROM master_pajak WHERE kode_pajak = 'PPN-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_jasa', id, 'Potongan PPh 23 atas Jasa', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH23-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_jasa', id, 'Potongan PPN atas Jasa dari PKP', false, 2
FROM master_pajak WHERE kode_pajak = 'PPN-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, tarif_khusus, uraian_template, is_default, urutan)
SELECT 'ls_jasa_konstruksi', id, 2.00, 'Potongan PPh Final Pasal 4(2) atas Jasa Konstruksi', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH42-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_jasa_konstruksi', id, 'Potongan PPN atas Jasa Konstruksi dari PKP', false, 2
FROM master_pajak WHERE kode_pajak = 'PPN-01';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, tarif_khusus, uraian_template, is_default, urutan)
SELECT 'ls_sewa', id, 10.00, 'Potongan PPh Final Pasal 4(2) atas Sewa Tanah/Bangunan', true, 1
FROM master_pajak WHERE kode_pajak = 'PPH42-02';

INSERT INTO pajak_per_jenis_spm (jenis_spm, master_pajak_id, uraian_template, is_default, urutan)
SELECT 'ls_belanja_modal', id, 'Potongan PPN atas Belanja Modal dari PKP', false, 1
FROM master_pajak WHERE kode_pajak = 'PPN-01';
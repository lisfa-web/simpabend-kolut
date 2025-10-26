-- ============================================
-- MAPPING UNTUK LS BARANG & JASA
-- ============================================

-- 1. PPh Pasal 22 untuk LS Barang & Jasa (DEFAULT)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_barang_jasa',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH22-01'),
  true,
  1,
  'Potongan PPh 22 atas pembelian barang dari rekanan'
);

-- 2. PPh Pasal 23 untuk LS Barang & Jasa (DEFAULT)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_barang_jasa',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH23-01'),
  true,
  2,
  'Potongan PPh 23 atas jasa konsultan/penyedia jasa'
);

-- 3. PPh Pasal 4 Ayat 2 (Konstruksi) untuk LS Barang & Jasa (OPSIONAL)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_barang_jasa',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH42-01'),
  false,
  3,
  'Potongan PPh Final atas jasa konstruksi'
);

-- 4. PPh Pasal 4 Ayat 2 (Sewa) untuk LS Barang & Jasa (OPSIONAL)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_barang_jasa',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH42-02'),
  false,
  4,
  'Potongan PPh Final atas sewa tanah/bangunan'
);

-- 5. PPN 11% untuk LS Barang & Jasa (DEFAULT)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_barang_jasa',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPN-01'),
  true,
  5,
  'Potongan PPN atas transaksi dengan PKP'
);

-- ============================================
-- MAPPING UNTUK LS BELANJA MODAL (LENGKAPI)
-- ============================================

-- 1. PPh Pasal 4 Ayat 2 (Konstruksi) untuk Belanja Modal (DEFAULT)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_belanja_modal',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH42-01'),
  true,
  1,
  'Potongan PPh Final atas jasa konstruksi/belanja modal'
);

-- 2. Update PPN untuk Belanja Modal menjadi DEFAULT
UPDATE pajak_per_jenis_spm 
SET is_default = true, urutan = 2
WHERE jenis_spm = 'ls_belanja_modal' 
AND master_pajak_id = (SELECT id FROM master_pajak WHERE kode_pajak = 'PPN-01');

-- 3. PPh Pasal 22 untuk Belanja Modal (OPSIONAL)
INSERT INTO pajak_per_jenis_spm (
  jenis_spm, 
  master_pajak_id, 
  is_default, 
  urutan, 
  uraian_template
) VALUES (
  'ls_belanja_modal',
  (SELECT id FROM master_pajak WHERE kode_pajak = 'PPH22-01'),
  false,
  3,
  'Potongan PPh 22 atas pembelian barang modal'
);
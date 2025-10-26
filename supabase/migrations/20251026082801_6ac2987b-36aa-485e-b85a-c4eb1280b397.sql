-- Tambah konfigurasi untuk kop surat cetak dokumen SP2D dan SPM
INSERT INTO config_sistem (key, value, description) VALUES
('kop_surat_sp2d_url', '', 'URL kop surat untuk cetak SP2D (Format: Logo + Header Instansi, PNG/JPG/PDF max 2MB)'),
('kop_surat_spm_url', '', 'URL kop surat untuk cetak SPM yang disetujui (Format: Logo + Header Instansi, PNG/JPG/PDF max 2MB)')
ON CONFLICT (key) DO NOTHING;
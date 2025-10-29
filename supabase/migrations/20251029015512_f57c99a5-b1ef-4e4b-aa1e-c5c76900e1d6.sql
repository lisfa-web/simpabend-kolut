-- Update jenis SPM yang sudah ada untuk menyesuaikan flag ada_pajak
UPDATE jenis_spm SET ada_pajak = false WHERE nama_jenis = 'UP (Uang Persediaan)';
UPDATE jenis_spm SET ada_pajak = false WHERE nama_jenis = 'GU (Ganti Uang)';
UPDATE jenis_spm SET ada_pajak = false WHERE nama_jenis = 'TU (Tambah Uang)';

-- Rename LS Gaji menjadi LS Pegawai
UPDATE jenis_spm SET 
  nama_jenis = 'LS Pegawai',
  deskripsi = 'Langsung (LS) untuk pembayaran gaji dan tunjangan pegawai'
WHERE nama_jenis = 'LS Gaji';

-- Insert jenis SPM baru yang belum ada
INSERT INTO jenis_spm (nama_jenis, ada_pajak, deskripsi, is_active) VALUES
('LS Hibah', false, 'Langsung (LS) untuk hibah kepada pihak ketiga', true),
('LS Bantuan Sosial', false, 'Langsung (LS) untuk bantuan sosial kepada masyarakat', true),
('LS Transfer', false, 'Langsung (LS) untuk transfer ke daerah/instansi lain', true),
('LS Pembiayaan', false, 'Langsung (LS) untuk pembiayaan', true),
('LS Tak Terduga', false, 'Langsung (LS) untuk belanja tak terduga', true)
ON CONFLICT DO NOTHING;
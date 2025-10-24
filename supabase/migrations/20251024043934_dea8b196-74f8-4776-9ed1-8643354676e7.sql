-- Create panduan_manual table
CREATE TABLE public.panduan_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(role, urutan)
);

-- Create indexes for faster queries
CREATE INDEX idx_panduan_manual_role ON public.panduan_manual(role);
CREATE INDEX idx_panduan_manual_is_active ON public.panduan_manual(is_active);

-- Enable RLS
ALTER TABLE public.panduan_manual ENABLE ROW LEVEL SECURITY;

-- Users can view guides for their roles
CREATE POLICY "Users can view guides for their roles"
ON public.panduan_manual
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), role) OR is_admin(auth.uid())
);

-- Only admin can manage guides
CREATE POLICY "Admins can manage guides"
ON public.panduan_manual
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Insert seed data for all roles
INSERT INTO public.panduan_manual (role, judul, konten, urutan) VALUES
-- Administrator
('administrator', 'Selamat Datang Administrator', '<h2>Panduan Administrator SIMPA BEND</h2><p>Anda memiliki akses penuh ke seluruh sistem. Sebagai administrator, Anda bertanggung jawab atas:</p><ul><li>Manajemen pengguna dan hak akses</li><li>Konfigurasi sistem</li><li>Pengelolaan master data</li><li>Monitoring aktivitas sistem</li></ul>', 1),
('administrator', 'Manajemen User', '<h3>Cara Menambah User Baru</h3><ol><li>Buka menu <strong>Manajemen User</strong></li><li>Klik tombol <strong>Tambah User</strong></li><li>Isi data user: nama lengkap, email, telepon</li><li>Pilih role yang sesuai dengan fungsi kerja</li><li>Jika user adalah Bendahara OPD, pilih OPD terkait</li><li>Sistem akan mengirimkan kredensial login via email</li></ol>', 2),
('administrator', 'Pengaturan Sistem', '<h3>Konfigurasi Sistem</h3><p>Menu pengaturan mencakup:</p><ul><li><strong>Email Gateway</strong>: Konfigurasi SMTP untuk notifikasi email</li><li><strong>WhatsApp Gateway</strong>: Integrasi notifikasi via WhatsApp</li><li><strong>Format Nomor</strong>: Pengaturan format penomoran dokumen</li><li><strong>Audit Trail</strong>: Monitoring seluruh aktivitas pengguna</li></ul>', 3),

-- Bendahara OPD
('bendahara_opd', 'Cara Input SPM', '<h2>Panduan Input SPM</h2><p>Langkah-langkah mengajukan SPM:</p><ol><li>Masuk ke menu <strong>Input SPM</strong></li><li>Klik tombol <strong>Buat SPM Baru</strong></li><li>Pilih <strong>OPD</strong>, <strong>Program</strong>, <strong>Kegiatan</strong>, dan <strong>Sub Kegiatan</strong></li><li>Pilih <strong>Jenis SPM</strong>: UP, GU, TU, LS Gaji, LS Barang/Jasa, LS Belanja Modal</li><li>Isi <strong>Nilai SPM</strong> dan <strong>Uraian</strong></li><li>Untuk SPM LS Barang/Jasa atau Belanja Modal, wajib pilih <strong>Vendor</strong></li><li>Upload semua lampiran yang diperlukan</li><li>Review data dan klik <strong>Submit untuk Verifikasi</strong></li></ol>', 1),
('bendahara_opd', 'Upload Lampiran SPM', '<h3>Lampiran yang Diperlukan</h3><p>Setiap SPM harus dilengkapi dengan dokumen berikut:</p><ul><li><strong>SPP (Surat Permintaan Pembayaran)</strong></li><li><strong>SPM</strong></li><li><strong>Ringkasan SPP</strong></li><li><strong>Rincian SPP</strong></li><li><strong>RAB (Rencana Anggaran Biaya)</strong></li><li><strong>Kontrak/SPK</strong> (untuk LS)</li><li><strong>Berita Acara Serah Terima</strong> (untuk LS)</li><li><strong>Invoice/Kwitansi</strong></li><li><strong>Rekening Koran</strong></li></ul><p>Format file yang diterima: PDF, JPG, PNG (Max 5MB per file)</p>', 2),
('bendahara_opd', 'Tracking Status SPM', '<h3>Cara Cek Status Verifikasi</h3><p>Anda dapat memantau progress SPM melalui:</p><ol><li>Masuk ke <strong>Input SPM</strong></li><li>Klik salah satu SPM untuk melihat detail</li><li>Timeline verifikasi akan menampilkan:<ul><li>✅ Resepsionis - Nomor antrian & berkas</li><li>✅ PBMD - Verifikasi kelengkapan aset</li><li>✅ Akuntansi - Validasi jurnal & kode rekening</li><li>✅ Perbendaharaan - Verifikasi anggaran</li><li>✅ Kepala BKAD - Approval akhir</li></ul></li></ol><p>Jika ada revisi, Anda akan menerima notifikasi dan catatan perbaikan.</p>', 3),

-- Resepsionis
('resepsionis', 'Tugas Resepsionis', '<h2>Panduan Verifikasi Resepsionis</h2><p>Sebagai resepsionis, tugas Anda adalah:</p><ul><li>Menerima dan mencatat SPM yang masuk</li><li>Memberikan <strong>Nomor Antrian</strong> dan <strong>Nomor Berkas</strong></li><li>Melakukan pengecekan awal kelengkapan dokumen</li><li>Meneruskan berkas ke tahap verifikasi berikutnya</li></ul><p>Verifikasi resepsionis adalah pintu masuk SPM ke dalam sistem verifikasi BKAD.</p>', 1),
('resepsionis', 'Cara Verifikasi SPM', '<h3>Langkah Verifikasi</h3><ol><li>Buka menu <strong>Verifikasi Resepsionis</strong></li><li>Pilih SPM yang akan diverifikasi</li><li>Periksa kelengkapan berkas fisik dan digital:<ul><li>SPP sudah lengkap?</li><li>Lampiran sesuai dengan jenis SPM?</li><li>Tidak ada dokumen yang rusak/tidak terbaca?</li></ul></li><li>Jika lengkap, klik <strong>Approve</strong> dan sistem akan auto-generate nomor antrian & berkas</li><li>Jika ada kekurangan, klik <strong>Revisi</strong> dan berikan catatan perbaikan</li></ol>', 2),

-- PBMD
('pbmd', 'Tugas PBMD', '<h2>Panduan Verifikasi PBMD</h2><p>Petugas Barang dan Jasa (PBMD) bertanggung jawab atas:</p><ul><li>Verifikasi kelengkapan dokumen pengadaan barang/jasa</li><li>Pengecekan kontrak/SPK dan BAST</li><li>Memastikan sesuai dengan inventaris dan aset daerah</li></ul><p>Verifikasi PBMD khusus untuk SPM terkait pengadaan barang dan jasa.</p>', 1),
('pbmd', 'Checklist Verifikasi', '<h3>Dokumen yang Harus Diperiksa</h3><ul><li><strong>Kontrak/SPK</strong>: Apakah sudah ditandatangani lengkap?</li><li><strong>BAST (Berita Acara Serah Terima)</strong>: Sudah ada tandatangan pihak terkait?</li><li><strong>Invoice/Kwitansi</strong>: Nilai sesuai dengan kontrak?</li><li><strong>Spesifikasi Barang/Jasa</strong>: Sesuai dengan yang diajukan?</li><li><strong>Foto Barang</strong>: Jika diperlukan</li></ul><p>Jika semua dokumen sudah sesuai, lakukan <strong>Approve</strong>. Jika ada ketidaksesuaian, berikan <strong>Revisi</strong> dengan catatan detail.</p>', 2),

-- Akuntansi
('akuntansi', 'Tugas Akuntansi', '<h2>Panduan Verifikasi Akuntansi</h2><p>Bagian akuntansi bertanggung jawab atas:</p><ul><li>Validasi kode rekening dan jurnal</li><li>Pengecekan kesesuaian anggaran dengan RKA/DPA</li><li>Memastikan tidak ada kesalahan pembukuan</li></ul><p>Verifikasi akuntansi memastikan aspek keuangan dan pembukuan sudah benar.</p>', 1),
('akuntansi', 'Cara Verifikasi Kode Rekening', '<h3>Langkah Verifikasi</h3><ol><li>Buka menu <strong>Verifikasi Akuntansi</strong></li><li>Pilih SPM yang akan divalidasi</li><li>Periksa:<ul><li>Kode rekening sesuai dengan jenis belanja?</li><li>Jurnal pembebanan sudah benar?</li><li>Nilai SPM tidak melebihi pagu anggaran?</li><li>DPA sudah disahkan?</li></ul></li><li>Jika valid, lakukan <strong>Approve</strong></li><li>Jika ada kesalahan kode rekening atau pembebanan, berikan <strong>Revisi</strong></li></ol>', 2),

-- Perbendaharaan
('perbendaharaan', 'Tugas Perbendaharaan', '<h2>Panduan Verifikasi Perbendaharaan</h2><p>Petugas perbendaharaan melakukan:</p><ul><li>Verifikasi ketersediaan anggaran</li><li>Pengecekan sisa pagu dan realisasi</li><li>Memastikan tidak ada over budget</li><li>Validasi rekening tujuan pembayaran</li></ul><p>Verifikasi perbendaharaan memastikan dana tersedia dan pembayaran dapat dilakukan.</p>', 1),

-- Kepala BKAD
('kepala_bkad', 'Tugas Kepala BKAD', '<h2>Panduan Approval Kepala BKAD</h2><p>Sebagai Kepala BKAD, Anda bertanggung jawab atas:</p><ul><li>Approval akhir SPM sebelum diterbitkan SP2D</li><li>Memastikan seluruh tahap verifikasi sudah selesai</li><li>Meninjau catatan dari setiap tahap verifikasi</li><li>Keputusan akhir approve atau reject SPM</li></ul><p>Approval Kepala BKAD adalah tahap terakhir sebelum SPM dapat dicairkan menjadi SP2D.</p>', 1),
('kepala_bkad', 'Cara Approval SPM', '<h3>Langkah Approval</h3><ol><li>Buka menu <strong>Approval Kepala BKAD</strong></li><li>Pilih SPM yang akan di-review</li><li>Review seluruh tahap verifikasi:<ul><li>✅ Resepsionis</li><li>✅ PBMD</li><li>✅ Akuntansi</li><li>✅ Perbendaharaan</li></ul></li><li>Pastikan tidak ada catatan revisi yang outstanding</li><li>Masukkan <strong>PIN</strong> untuk approval</li><li>Klik <strong>Approve</strong> jika sudah sesuai</li><li>SPM akan masuk ke Kuasa BUD untuk proses penerbitan SP2D</li></ol>', 2),

-- Kuasa BUD
('kuasa_bud', 'Tugas Kuasa BUD', '<h2>Panduan Pengelolaan SP2D</h2><p>Sebagai Kuasa BUD, Anda mengelola:</p><ul><li>Penerbitan SP2D dari SPM yang sudah disetujui</li><li>Generate nomor SP2D otomatis</li><li>Input data rekening tujuan pembayaran</li><li>Verifikasi OTP sebelum SP2D diterbitkan</li></ul><p>SP2D adalah dokumen akhir yang memerintahkan Bank untuk melakukan transfer dana.</p>', 1),
('kuasa_bud', 'Cara Input SP2D', '<h3>Langkah Input SP2D</h3><ol><li>Buka menu <strong>SP2D</strong></li><li>Klik <strong>Buat SP2D</strong></li><li>Pilih SPM yang sudah disetujui Kepala BKAD</li><li>Sistem akan auto-generate nomor SP2D</li><li>Isi data rekening tujuan:<ul><li>Nama Bank</li><li>Nomor Rekening</li><li>Nama Penerima</li></ul></li><li>Verifikasi OTP yang dikirim via WhatsApp/Email</li><li>Klik <strong>Terbitkan SP2D</strong></li><li>SP2D dapat dicetak dan dikirim ke Bank untuk pencairan</li></ol>', 2);
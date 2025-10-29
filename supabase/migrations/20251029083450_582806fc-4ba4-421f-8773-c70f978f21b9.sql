-- Reset semua nomor antrian dan nomor berkas yang menggunakan format lama
-- Ini akan memaksa semua SPM untuk mendapatkan nomor antrian baru dengan format baru (001-DDMMYY)
-- ketika diverifikasi oleh resepsionis

UPDATE public.spm 
SET nomor_antrian = NULL, nomor_berkas = NULL
WHERE nomor_antrian IS NOT NULL OR nomor_berkas IS NOT NULL;
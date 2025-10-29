-- Reset nomor_antrian dan nomor_berkas yang lama
-- Semua SPM akan menggunakan format baru (3 digit, reset harian)
UPDATE public.spm 
SET nomor_antrian = NULL, 
    nomor_berkas = NULL;
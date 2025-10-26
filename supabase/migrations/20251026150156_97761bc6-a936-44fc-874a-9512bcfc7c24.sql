-- Update jenis_spm values to match enum format
UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'UP' 
WHERE jenis_spm = 'up';

UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'GU' 
WHERE jenis_spm = 'gu';

UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'TU' 
WHERE jenis_spm = 'tu';

UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'LS_Gaji' 
WHERE jenis_spm = 'ls_gaji';

UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'LS_Barang_Jasa' 
WHERE jenis_spm = 'ls_barang_jasa';

UPDATE pajak_per_jenis_spm 
SET jenis_spm = 'LS_Belanja_Modal' 
WHERE jenis_spm = 'ls_belanja_modal';
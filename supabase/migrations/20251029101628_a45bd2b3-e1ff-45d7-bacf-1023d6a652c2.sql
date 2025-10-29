-- Fix existing SPM records with disetujui status but NULL tanggal_disetujui
UPDATE spm 
SET tanggal_disetujui = tanggal_kepala_bkad
WHERE status = 'disetujui' 
  AND tanggal_disetujui IS NULL 
  AND tanggal_kepala_bkad IS NOT NULL;

-- For records where even tanggal_kepala_bkad is NULL, use updated_at
UPDATE spm 
SET tanggal_disetujui = updated_at
WHERE status = 'disetujui' 
  AND tanggal_disetujui IS NULL;
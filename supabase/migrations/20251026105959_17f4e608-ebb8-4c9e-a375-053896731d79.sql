-- Delete granular pajak mappings (keep only the 6 standard SPM types)
DELETE FROM pajak_per_jenis_spm 
WHERE jenis_spm IN ('ls_barang', 'ls_jasa', 'ls_honorarium', 'ls_jasa_konstruksi', 'ls_sewa');
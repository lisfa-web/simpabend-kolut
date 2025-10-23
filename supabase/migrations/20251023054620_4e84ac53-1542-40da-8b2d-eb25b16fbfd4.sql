-- Add format nomor for antrian_spm and berkas_spm
INSERT INTO format_nomor (jenis_dokumen, tahun, format, counter)
VALUES 
  ('antrian_spm', EXTRACT(YEAR FROM now())::integer, 'A-{nomor}', 0),
  ('berkas_spm', EXTRACT(YEAR FROM now())::integer, '{nomor}/BERKAS-SPM/{romawi_bulan}/{tahun}', 0)
ON CONFLICT DO NOTHING;

-- Create trigger function to auto-assign verification numbers
CREATE OR REPLACE FUNCTION assign_verification_numbers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign numbers when status changes to resepsionis_verifikasi
  -- and the numbers are not already set
  IF NEW.status = 'resepsionis_verifikasi' AND OLD.status = 'diajukan' THEN
    -- Generate nomor_antrian if not set
    IF NEW.nomor_antrian IS NULL THEN
      NEW.nomor_antrian := generate_document_number('antrian_spm', COALESCE(NEW.tanggal_resepsionis, now()));
    END IF;
    
    -- Generate nomor_berkas if not set
    IF NEW.nomor_berkas IS NULL THEN
      NEW.nomor_berkas := generate_document_number('berkas_spm', COALESCE(NEW.tanggal_resepsionis, now()));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_assign_verification_numbers ON spm;
CREATE TRIGGER trigger_assign_verification_numbers
  BEFORE UPDATE ON spm
  FOR EACH ROW
  EXECUTE FUNCTION assign_verification_numbers();
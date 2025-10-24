-- Add configuration for file size unit
INSERT INTO config_sistem (key, value, description) 
VALUES ('max_file_size_unit', 'MB', 'Satuan ukuran file maksimal (KB atau MB)')
ON CONFLICT (key) DO NOTHING;

-- Function to sync all file size configs when max_file_size changes
CREATE OR REPLACE FUNCTION sync_file_sizes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.key = 'max_file_size' AND NEW.value IS DISTINCT FROM OLD.value THEN
    UPDATE config_sistem 
    SET value = NEW.value, updated_at = now()
    WHERE key IN (
      'max_file_size_dokumen_spm',
      'max_file_size_tbk', 
      'max_file_size_spj',
      'max_file_size_lainnya'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-sync file sizes
DROP TRIGGER IF EXISTS trigger_sync_file_sizes ON config_sistem;
CREATE TRIGGER trigger_sync_file_sizes
AFTER UPDATE ON config_sistem
FOR EACH ROW
EXECUTE FUNCTION sync_file_sizes();
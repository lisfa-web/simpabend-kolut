-- Ensure telepon column exists in vendor table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vendor' 
    AND column_name = 'telepon'
  ) THEN
    ALTER TABLE public.vendor ADD COLUMN telepon VARCHAR(20);
  END IF;
END $$;

COMMENT ON COLUMN public.vendor.telepon IS 'Nomor telepon/WhatsApp vendor untuk notifikasi pencairan dana';
-- Add new columns to sp2d table for document upload and bank testing process
ALTER TABLE public.sp2d
ADD COLUMN IF NOT EXISTS dokumen_sp2d_url TEXT,
ADD COLUMN IF NOT EXISTS tanggal_kirim_bank TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tanggal_konfirmasi_bank TIMESTAMP WITH TIME ZONE;

-- Add new status to status_sp2d enum for bank testing
-- First, check if the value already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'diuji_bank' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_sp2d')
  ) THEN
    ALTER TYPE status_sp2d ADD VALUE 'diuji_bank' AFTER 'diterbitkan';
  END IF;
END $$;

COMMENT ON COLUMN public.sp2d.dokumen_sp2d_url IS 'URL dokumen SP2D yang sudah discan dengan tanda tangan dan cap basah';
COMMENT ON COLUMN public.sp2d.tanggal_kirim_bank IS 'Tanggal SP2D dikirim ke Bank Sultra untuk diproses';
COMMENT ON COLUMN public.sp2d.tanggal_konfirmasi_bank IS 'Tanggal konfirmasi dari Bank Sultra bahwa pemindahbukuan telah selesai';
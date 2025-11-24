-- Add bendahara fields to opd table
ALTER TABLE public.opd 
ADD COLUMN IF NOT EXISTS nama_bendahara TEXT,
ADD COLUMN IF NOT EXISTS nomor_rekening_bendahara TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.opd.nama_bendahara IS 'Nama Bendahara Pengeluaran OPD';
COMMENT ON COLUMN public.opd.nomor_rekening_bendahara IS 'Nomor Rekening Bendahara Pengeluaran OPD';
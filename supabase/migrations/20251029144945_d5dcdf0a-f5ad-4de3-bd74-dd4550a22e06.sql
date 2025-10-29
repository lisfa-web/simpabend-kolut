-- Create bendahara_pengeluaran table
CREATE TABLE IF NOT EXISTS public.bendahara_pengeluaran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_bendahara TEXT NOT NULL,
  nip TEXT,
  alamat TEXT,
  telepon TEXT,
  email TEXT,
  nama_bank TEXT,
  nomor_rekening TEXT,
  nama_rekening TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bendahara_pengeluaran ENABLE ROW LEVEL SECURITY;

-- Create policies for bendahara_pengeluaran
CREATE POLICY "Users can view bendahara_pengeluaran"
ON public.bendahara_pengeluaran
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create bendahara_pengeluaran"
ON public.bendahara_pengeluaran
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update bendahara_pengeluaran"
ON public.bendahara_pengeluaran
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete bendahara_pengeluaran"
ON public.bendahara_pengeluaran
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bendahara_pengeluaran_updated_at
BEFORE UPDATE ON public.bendahara_pengeluaran
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_bendahara_pengeluaran_nama ON public.bendahara_pengeluaran(nama_bendahara);
CREATE INDEX idx_bendahara_pengeluaran_active ON public.bendahara_pengeluaran(is_active);
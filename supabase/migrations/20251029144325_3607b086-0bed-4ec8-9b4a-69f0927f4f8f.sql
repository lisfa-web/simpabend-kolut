-- Create pihak_ketiga table for third party recipients
CREATE TABLE IF NOT EXISTS public.pihak_ketiga (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_pihak_ketiga TEXT NOT NULL,
  npwp TEXT,
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
ALTER TABLE public.pihak_ketiga ENABLE ROW LEVEL SECURITY;

-- Create policies for pihak_ketiga
CREATE POLICY "Users can view pihak_ketiga"
ON public.pihak_ketiga
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create pihak_ketiga"
ON public.pihak_ketiga
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update pihak_ketiga"
ON public.pihak_ketiga
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete pihak_ketiga"
ON public.pihak_ketiga
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pihak_ketiga_updated_at
BEFORE UPDATE ON public.pihak_ketiga
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_pihak_ketiga_nama ON public.pihak_ketiga(nama_pihak_ketiga);
CREATE INDEX idx_pihak_ketiga_active ON public.pihak_ketiga(is_active);
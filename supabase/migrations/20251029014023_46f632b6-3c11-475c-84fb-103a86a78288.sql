-- Drop the existing jenis_spm enum type first
DROP TYPE IF EXISTS public.jenis_spm CASCADE;

-- Create jenis_spm table
CREATE TABLE IF NOT EXISTS public.jenis_spm (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_jenis TEXT NOT NULL,
  deskripsi TEXT,
  ada_pajak BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for jenis_spm
ALTER TABLE public.jenis_spm ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jenis_spm
CREATE POLICY "All authenticated can read jenis_spm" 
ON public.jenis_spm 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage jenis_spm" 
ON public.jenis_spm 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add kategori column to master_pajak if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'master_pajak' 
    AND column_name = 'kategori'
  ) THEN
    ALTER TABLE public.master_pajak ADD COLUMN kategori TEXT;
  END IF;
END $$;

-- Drop old columns from spm table
ALTER TABLE public.spm DROP COLUMN IF EXISTS program_id;
ALTER TABLE public.spm DROP COLUMN IF EXISTS kegiatan_id;
ALTER TABLE public.spm DROP COLUMN IF EXISTS subkegiatan_id;

-- Add jenis_spm_id column to spm table
ALTER TABLE public.spm ADD COLUMN IF NOT EXISTS jenis_spm_id UUID REFERENCES public.jenis_spm(id);

-- Add new columns to spm table
ALTER TABLE public.spm ADD COLUMN IF NOT EXISTS is_aset BOOLEAN DEFAULT false;
ALTER TABLE public.spm ADD COLUMN IF NOT EXISTS nama_bank TEXT;
ALTER TABLE public.spm ADD COLUMN IF NOT EXISTS nomor_rekening TEXT;
ALTER TABLE public.spm ADD COLUMN IF NOT EXISTS nama_rekening TEXT;

-- Update trigger for jenis_spm
CREATE TRIGGER update_jenis_spm_updated_at
BEFORE UPDATE ON public.jenis_spm
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger for jenis_spm
CREATE TRIGGER audit_jenis_spm_changes
AFTER INSERT OR UPDATE OR DELETE ON public.jenis_spm
FOR EACH ROW
EXECUTE FUNCTION public.audit_master_data_changes();

-- Drop old tables
DROP TABLE IF EXISTS public.subkegiatan CASCADE;
DROP TABLE IF EXISTS public.kegiatan CASCADE;
DROP TABLE IF EXISTS public.program CASCADE;

-- Insert default jenis_spm data
INSERT INTO public.jenis_spm (nama_jenis, deskripsi, ada_pajak, is_active) VALUES
('UP (Uang Persediaan)', 'Uang Persediaan untuk kebutuhan operasional', true, true),
('GU (Ganti Uang)', 'Penggantian Uang Persediaan yang telah digunakan', true, true),
('TU (Tambah Uang)', 'Tambahan Uang Persediaan', true, true),
('LS Gaji', 'Langsung (LS) untuk pembayaran gaji pegawai', true, true),
('LS Barang & Jasa', 'Langsung (LS) untuk pengadaan barang dan jasa', true, true),
('LS Belanja Modal', 'Langsung (LS) untuk belanja modal/aset', true, true)
ON CONFLICT DO NOTHING;
-- Create enum for tax types
CREATE TYPE jenis_pajak AS ENUM (
  'pph_21',
  'pph_22',
  'pph_23',
  'pph_4_ayat_2',
  'ppn'
);

-- Create table for tax deductions in SP2D
CREATE TABLE public.potongan_pajak_sp2d (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sp2d_id UUID NOT NULL REFERENCES public.sp2d(id) ON DELETE CASCADE,
  jenis_pajak jenis_pajak NOT NULL,
  rekening_pajak VARCHAR(50),
  uraian TEXT NOT NULL,
  tarif DECIMAL(5,2) NOT NULL, -- Tarif in percentage (e.g., 2.5 for 2.5%)
  dasar_pengenaan NUMERIC NOT NULL, -- Base amount for tax calculation
  jumlah_pajak NUMERIC NOT NULL, -- Calculated tax amount
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to sp2d table
ALTER TABLE public.sp2d 
ADD COLUMN total_potongan NUMERIC DEFAULT 0,
ADD COLUMN nilai_diterima NUMERIC;

-- Create index for faster lookups
CREATE INDEX idx_potongan_pajak_sp2d_sp2d_id ON public.potongan_pajak_sp2d(sp2d_id);

-- Enable RLS
ALTER TABLE public.potongan_pajak_sp2d ENABLE ROW LEVEL SECURITY;

-- RLS Policies for potongan_pajak_sp2d
CREATE POLICY "Authorized can view tax deductions"
ON public.potongan_pajak_sp2d FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sp2d
    WHERE sp2d.id = potongan_pajak_sp2d.sp2d_id
    AND (
      has_role(auth.uid(), 'kuasa_bud') OR
      has_role(auth.uid(), 'kepala_bkad') OR
      is_admin(auth.uid())
    )
  )
);

CREATE POLICY "Kuasa BUD can manage tax deductions"
ON public.potongan_pajak_sp2d FOR ALL
USING (
  has_role(auth.uid(), 'kuasa_bud') OR
  is_admin(auth.uid())
);

-- Trigger to update updated_at
CREATE TRIGGER update_potongan_pajak_updated_at
BEFORE UPDATE ON public.potongan_pajak_sp2d
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recalculate SP2D totals after tax changes
CREATE OR REPLACE FUNCTION recalculate_sp2d_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sp2d
  SET 
    total_potongan = (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM public.potongan_pajak_sp2d
      WHERE sp2d_id = COALESCE(NEW.sp2d_id, OLD.sp2d_id)
    ),
    nilai_diterima = nilai_sp2d - (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM public.potongan_pajak_sp2d
      WHERE sp2d_id = COALESCE(NEW.sp2d_id, OLD.sp2d_id)
    )
  WHERE id = COALESCE(NEW.sp2d_id, OLD.sp2d_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to recalculate on INSERT, UPDATE, DELETE
CREATE TRIGGER recalculate_sp2d_on_tax_insert
AFTER INSERT ON public.potongan_pajak_sp2d
FOR EACH ROW
EXECUTE FUNCTION recalculate_sp2d_totals();

CREATE TRIGGER recalculate_sp2d_on_tax_update
AFTER UPDATE ON public.potongan_pajak_sp2d
FOR EACH ROW
EXECUTE FUNCTION recalculate_sp2d_totals();

CREATE TRIGGER recalculate_sp2d_on_tax_delete
AFTER DELETE ON public.potongan_pajak_sp2d
FOR EACH ROW
EXECUTE FUNCTION recalculate_sp2d_totals();
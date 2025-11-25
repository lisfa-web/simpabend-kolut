-- Create master_bank table
CREATE TABLE IF NOT EXISTS public.master_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_bank VARCHAR(10) NOT NULL UNIQUE,
  nama_bank TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on master_bank
ALTER TABLE public.master_bank ENABLE ROW LEVEL SECURITY;

-- RLS policies for master_bank
CREATE POLICY "All authenticated can read master_bank"
  ON public.master_bank
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage master_bank"
  ON public.master_bank
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Add bank_id to opd table
ALTER TABLE public.opd 
  ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.master_bank(id);

-- Add bank_id to vendor table  
ALTER TABLE public.vendor
  ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.master_bank(id);

-- Add bank_id to pihak_ketiga table
ALTER TABLE public.pihak_ketiga
  ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.master_bank(id);

-- Insert common Indonesian banks
INSERT INTO public.master_bank (kode_bank, nama_bank) VALUES
  ('002', 'Bank BRI'),
  ('008', 'Bank Mandiri'),
  ('009', 'Bank BNI'),
  ('451', 'Bank Syariah Indonesia (BSI)'),
  ('022', 'Bank CIMB Niaga'),
  ('013', 'Bank Permata'),
  ('011', 'Bank Danamon'),
  ('016', 'Bank Maybank'),
  ('028', 'Bank OCBC NISP'),
  ('213', 'Bank BTPN'),
  ('427', 'Bank Syariah Indonesia'),
  ('147', 'Bank Muamalat'),
  ('200', 'Bank BTN'),
  ('046', 'Bank DBS Indonesia'),
  ('023', 'Bank UOB Indonesia')
ON CONFLICT (kode_bank) DO NOTHING;

-- Drop bendahara_pengeluaran table and related objects
DROP TABLE IF EXISTS public.bendahara_pengeluaran CASCADE;

-- Add updated_at trigger for master_bank
CREATE TRIGGER update_master_bank_updated_at
  BEFORE UPDATE ON public.master_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit trigger for master_bank
CREATE TRIGGER audit_master_bank_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.master_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_master_data_changes();
-- Create arsip_spm table
CREATE TABLE IF NOT EXISTS public.arsip_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID NOT NULL REFERENCES public.spm(id) ON DELETE CASCADE,
  bendahara_id UUID NOT NULL REFERENCES public.profiles(id),
  opd_id UUID NOT NULL REFERENCES public.opd(id),
  nomor_spm VARCHAR NOT NULL,
  tanggal_spm TIMESTAMP WITH TIME ZONE NOT NULL,
  nilai_spm NUMERIC NOT NULL,
  nilai_bersih NUMERIC,
  nama_penerima TEXT,
  status TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create arsip_sp2d table
CREATE TABLE IF NOT EXISTS public.arsip_sp2d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp2d_id UUID NOT NULL REFERENCES public.sp2d(id) ON DELETE CASCADE,
  spm_id UUID NOT NULL REFERENCES public.spm(id),
  bendahara_id UUID NOT NULL REFERENCES public.profiles(id),
  opd_id UUID NOT NULL REFERENCES public.opd(id),
  nomor_sp2d VARCHAR NOT NULL,
  tanggal_sp2d TIMESTAMP WITH TIME ZONE NOT NULL,
  nilai_sp2d NUMERIC NOT NULL,
  nilai_diterima NUMERIC,
  status TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arsip_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsip_sp2d ENABLE ROW LEVEL SECURITY;

-- RLS Policies for arsip_spm
CREATE POLICY "Bendahara can view own archived SPM"
ON public.arsip_spm
FOR SELECT
TO authenticated
USING (auth.uid() = bendahara_id OR is_admin(auth.uid()));

CREATE POLICY "Authorized can create archived SPM"
ON public.arsip_spm
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = bendahara_id OR is_admin(auth.uid()));

-- RLS Policies for arsip_sp2d
CREATE POLICY "Bendahara can view own archived SP2D"
ON public.arsip_sp2d
FOR SELECT
TO authenticated
USING (auth.uid() = bendahara_id OR is_admin(auth.uid()));

CREATE POLICY "Authorized can create archived SP2D"
ON public.arsip_sp2d
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = bendahara_id OR is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_arsip_spm_bendahara ON public.arsip_spm(bendahara_id);
CREATE INDEX idx_arsip_spm_opd ON public.arsip_spm(opd_id);
CREATE INDEX idx_arsip_spm_tanggal ON public.arsip_spm(tanggal_spm);
CREATE INDEX idx_arsip_sp2d_bendahara ON public.arsip_sp2d(bendahara_id);
CREATE INDEX idx_arsip_sp2d_opd ON public.arsip_sp2d(opd_id);
CREATE INDEX idx_arsip_sp2d_tanggal ON public.arsip_sp2d(tanggal_sp2d);

-- Add audit triggers
CREATE TRIGGER audit_arsip_spm_changes
AFTER INSERT OR UPDATE OR DELETE ON public.arsip_spm
FOR EACH ROW EXECUTE FUNCTION audit_master_data_changes();

CREATE TRIGGER audit_arsip_sp2d_changes
AFTER INSERT OR UPDATE OR DELETE ON public.arsip_sp2d
FOR EACH ROW EXECUTE FUNCTION audit_master_data_changes();
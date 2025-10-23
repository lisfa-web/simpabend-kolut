-- =====================================================
-- FASE 1: Database Schema & Authentication System
-- SIMPA BEND BKADKU - BKAD Kolaka Utara
-- =====================================================

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM (
  'administrator',
  'bendahara_opd',
  'resepsionis',
  'pbmd',
  'akuntansi',
  'perbendaharaan',
  'kepala_bkad',
  'kuasa_bud',
  'publik'
);

CREATE TYPE public.status_spm AS ENUM (
  'draft',
  'diajukan',
  'resepsionis_verifikasi',
  'pbmd_verifikasi',
  'akuntansi_validasi',
  'perbendaharaan_verifikasi',
  'kepala_bkad_review',
  'disetujui',
  'ditolak',
  'perlu_revisi'
);

CREATE TYPE public.jenis_spm AS ENUM (
  'UP',
  'GU',
  'TU',
  'LS_Gaji',
  'LS_Barang_Jasa',
  'LS_Belanja_Modal'
);

CREATE TYPE public.status_sp2d AS ENUM (
  'pending',
  'diproses',
  'diterbitkan',
  'cair',
  'gagal'
);

CREATE TYPE public.jenis_lampiran AS ENUM (
  'spm',
  'tbk',
  'spj',
  'kwitansi',
  'kontrak',
  'lainnya'
);

CREATE TYPE public.jenis_notifikasi AS ENUM (
  'spm_diajukan',
  'spm_disetujui',
  'spm_ditolak',
  'spm_perlu_revisi',
  'sp2d_diterbitkan',
  'verifikasi_pin',
  'verifikasi_otp'
);

-- ============ MASTER DATA TABLES ============

-- 1. OPD (Organisasi Perangkat Daerah)
CREATE TABLE public.opd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_opd VARCHAR(20) UNIQUE NOT NULL,
  nama_opd TEXT NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Pejabat (Officials)
CREATE TABLE public.pejabat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opd_id UUID REFERENCES public.opd(id) ON DELETE CASCADE,
  nip VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  ttd_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Roles (RBAC - CRITICAL: Separate from auth.users)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  opd_id UUID REFERENCES public.opd(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 4. User Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  resource TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. WA Gateway Configuration (Fonnte Integration)
CREATE TABLE public.wa_gateway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_test_at TIMESTAMPTZ,
  test_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Program
CREATE TABLE public.program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_program VARCHAR(50) UNIQUE NOT NULL,
  nama_program TEXT NOT NULL,
  tahun_anggaran INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Kegiatan
CREATE TABLE public.kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.program(id) ON DELETE CASCADE NOT NULL,
  kode_kegiatan VARCHAR(50) UNIQUE NOT NULL,
  nama_kegiatan TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Sub Kegiatan
CREATE TABLE public.subkegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID REFERENCES public.kegiatan(id) ON DELETE CASCADE NOT NULL,
  kode_subkegiatan VARCHAR(50) UNIQUE NOT NULL,
  nama_subkegiatan TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Vendor/Pihak Ketiga
CREATE TABLE public.vendor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_vendor TEXT NOT NULL,
  npwp VARCHAR(30),
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(255),
  nama_rekening TEXT,
  nomor_rekening VARCHAR(50),
  nama_bank TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Format Nomor
CREATE TABLE public.format_nomor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_dokumen TEXT NOT NULL,
  format TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  tahun INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Template Surat
CREATE TABLE public.template_surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_template TEXT NOT NULL,
  jenis_surat TEXT NOT NULL,
  konten_html TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Config Sistem
CREATE TABLE public.config_sistem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ TRANSACTION TABLES ============

-- 14. SPM (Main Transaction)
CREATE TABLE public.spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_spm VARCHAR(50) UNIQUE,
  nomor_berkas VARCHAR(50) UNIQUE,
  nomor_antrian VARCHAR(20),
  jenis_spm public.jenis_spm NOT NULL,
  status public.status_spm DEFAULT 'draft',
  
  -- OPD & User Info
  opd_id UUID REFERENCES public.opd(id) NOT NULL,
  bendahara_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Program/Kegiatan
  program_id UUID REFERENCES public.program(id),
  kegiatan_id UUID REFERENCES public.kegiatan(id),
  subkegiatan_id UUID REFERENCES public.subkegiatan(id),
  
  -- Nominal
  nilai_spm DECIMAL(15,2) NOT NULL,
  
  -- LS Specific Fields
  vendor_id UUID REFERENCES public.vendor(id),
  uraian TEXT,
  
  -- Workflow Timestamps
  tanggal_ajuan TIMESTAMPTZ DEFAULT now(),
  tanggal_resepsionis TIMESTAMPTZ,
  tanggal_pbmd TIMESTAMPTZ,
  tanggal_akuntansi TIMESTAMPTZ,
  tanggal_perbendaharaan TIMESTAMPTZ,
  tanggal_kepala_bkad TIMESTAMPTZ,
  tanggal_disetujui TIMESTAMPTZ,
  
  -- Workflow Notes
  catatan_resepsionis TEXT,
  catatan_pbmd TEXT,
  catatan_akuntansi TEXT,
  catatan_perbendaharaan TEXT,
  catatan_kepala_bkad TEXT,
  
  -- Verification
  verified_by_kepala_bkad UUID REFERENCES auth.users(id),
  pin_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Lampiran SPM
CREATE TABLE public.lampiran_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID REFERENCES public.spm(id) ON DELETE CASCADE NOT NULL,
  jenis_lampiran public.jenis_lampiran NOT NULL,
  nama_file TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. SP2D
CREATE TABLE public.sp2d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID REFERENCES public.spm(id) ON DELETE CASCADE NOT NULL,
  nomor_sp2d VARCHAR(50) UNIQUE NOT NULL,
  tanggal_sp2d TIMESTAMPTZ DEFAULT now(),
  nilai_sp2d DECIMAL(15,2) NOT NULL,
  status public.status_sp2d DEFAULT 'pending',
  
  -- Bank Info
  nama_bank TEXT,
  nomor_rekening VARCHAR(50),
  nama_rekening TEXT,
  
  -- Verification
  kuasa_bud_id UUID REFERENCES auth.users(id),
  otp_verified_at TIMESTAMPTZ,
  ttd_digital_url TEXT,
  
  tanggal_cair TIMESTAMPTZ,
  catatan TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Revisi SPM
CREATE TABLE public.revisi_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID REFERENCES public.spm(id) ON DELETE CASCADE NOT NULL,
  revisi_dari_status public.status_spm NOT NULL,
  catatan_revisi TEXT NOT NULL,
  revisi_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. PIN/OTP Storage
CREATE TABLE public.pin_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  kode_hash TEXT NOT NULL,
  jenis TEXT NOT NULL,
  spm_id UUID REFERENCES public.spm(id),
  sp2d_id UUID REFERENCES public.sp2d(id),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Notifikasi
CREATE TABLE public.notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  jenis public.jenis_notifikasi NOT NULL,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  spm_id UUID REFERENCES public.spm(id),
  is_read BOOLEAN DEFAULT false,
  sent_via_wa BOOLEAN DEFAULT false,
  wa_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Public Token (For PENGUMUMAN)
CREATE TABLE public.public_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spm_id UUID REFERENCES public.spm(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Audit Log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX idx_spm_status ON public.spm(status);
CREATE INDEX idx_spm_opd ON public.spm(opd_id);
CREATE INDEX idx_spm_bendahara ON public.spm(bendahara_id);
CREATE INDEX idx_spm_tanggal ON public.spm(tanggal_ajuan);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_notifikasi_user ON public.notifikasi(user_id, is_read);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at);
CREATE INDEX idx_public_token_token ON public.public_token(token);

-- ============ FUNCTIONS ============

-- Security Definer Function: Check User Role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security Definer Function: Check Any Admin Role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('administrator', 'kepala_bkad')
  )
$$;

-- Function: Update Updated_At Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: Handle New User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- ============ TRIGGERS ============

-- Trigger: Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers: Update updated_at timestamps
CREATE TRIGGER update_opd_updated_at BEFORE UPDATE ON public.opd
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pejabat_updated_at BEFORE UPDATE ON public.pejabat
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spm_updated_at BEFORE UPDATE ON public.spm
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sp2d_updated_at BEFORE UPDATE ON public.sp2d
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROW LEVEL SECURITY (RLS) ============

-- Enable RLS on all tables
ALTER TABLE public.opd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pejabat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_gateway ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subkegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.format_nomor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_sistem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampiran_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sp2d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisi_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- Profiles: Users can view own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- User Roles: Only admins can manage
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Master Data: Authenticated users can read, admins can manage
CREATE POLICY "All authenticated can read OPD"
  ON public.opd FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage OPD"
  ON public.opd FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read pejabat"
  ON public.pejabat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage pejabat"
  ON public.pejabat FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read program"
  ON public.program FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage program"
  ON public.program FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read kegiatan"
  ON public.kegiatan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage kegiatan"
  ON public.kegiatan FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read subkegiatan"
  ON public.subkegiatan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subkegiatan"
  ON public.subkegiatan FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read vendor"
  ON public.vendor FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage vendor"
  ON public.vendor FOR ALL
  USING (public.is_admin(auth.uid()));

-- WA Gateway: Only admins
CREATE POLICY "Admins can manage WA Gateway"
  ON public.wa_gateway FOR ALL
  USING (public.is_admin(auth.uid()));

-- Config & Templates: Admins only
CREATE POLICY "Admins can manage config"
  ON public.config_sistem FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "All authenticated can read templates"
  ON public.template_surat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON public.template_surat FOR ALL
  USING (public.is_admin(auth.uid()));

-- SPM: Complex role-based access
CREATE POLICY "Bendahara can create own SPM"
  ON public.spm FOR INSERT
  WITH CHECK (
    auth.uid() = bendahara_id AND
    public.has_role(auth.uid(), 'bendahara_opd')
  );

CREATE POLICY "Users can view related SPM"
  ON public.spm FOR SELECT
  USING (
    auth.uid() = bendahara_id OR
    public.has_role(auth.uid(), 'resepsionis') OR
    public.has_role(auth.uid(), 'pbmd') OR
    public.has_role(auth.uid(), 'akuntansi') OR
    public.has_role(auth.uid(), 'perbendaharaan') OR
    public.has_role(auth.uid(), 'kepala_bkad') OR
    public.has_role(auth.uid(), 'kuasa_bud') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Authorized users can update SPM"
  ON public.spm FOR UPDATE
  USING (
    (auth.uid() = bendahara_id AND status = 'draft') OR
    public.has_role(auth.uid(), 'resepsionis') OR
    public.has_role(auth.uid(), 'pbmd') OR
    public.has_role(auth.uid(), 'akuntansi') OR
    public.has_role(auth.uid(), 'perbendaharaan') OR
    public.has_role(auth.uid(), 'kepala_bkad') OR
    public.is_admin(auth.uid())
  );

-- Lampiran SPM: Same access as SPM
CREATE POLICY "Users can view SPM attachments"
  ON public.lampiran_spm FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spm
      WHERE spm.id = lampiran_spm.spm_id
      AND (
        auth.uid() = spm.bendahara_id OR
        public.has_role(auth.uid(), 'resepsionis') OR
        public.has_role(auth.uid(), 'pbmd') OR
        public.has_role(auth.uid(), 'akuntansi') OR
        public.has_role(auth.uid(), 'perbendaharaan') OR
        public.has_role(auth.uid(), 'kepala_bkad') OR
        public.has_role(auth.uid(), 'kuasa_bud') OR
        public.is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Bendahara can upload attachments"
  ON public.lampiran_spm FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- SP2D: Kuasa BUD and admins
CREATE POLICY "Authorized can view SP2D"
  ON public.sp2d FOR SELECT
  USING (
    public.has_role(auth.uid(), 'kuasa_bud') OR
    public.has_role(auth.uid(), 'kepala_bkad') OR
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.spm
      WHERE spm.id = sp2d.spm_id AND auth.uid() = spm.bendahara_id
    )
  );

CREATE POLICY "Kuasa BUD can manage SP2D"
  ON public.sp2d FOR ALL
  USING (
    public.has_role(auth.uid(), 'kuasa_bud') OR
    public.is_admin(auth.uid())
  );

-- Notifikasi: Users see own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifikasi FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifikasi FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifikasi FOR INSERT
  WITH CHECK (true);

-- Public Token: Public access for validation
CREATE POLICY "Public can read valid tokens"
  ON public.public_token FOR SELECT
  USING (expires_at IS NULL OR expires_at > now());

-- Audit Log: Admins only
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- PIN/OTP: Own data only
CREATE POLICY "Users can view own PIN/OTP"
  ON public.pin_otp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create PIN/OTP"
  ON public.pin_otp FOR INSERT
  WITH CHECK (true);

-- Revisi SPM: Read by authorized users
CREATE POLICY "Users can view SPM revisions"
  ON public.revisi_spm FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spm
      WHERE spm.id = revisi_spm.spm_id
      AND (
        auth.uid() = spm.bendahara_id OR
        public.has_role(auth.uid(), 'resepsionis') OR
        public.has_role(auth.uid(), 'pbmd') OR
        public.has_role(auth.uid(), 'akuntansi') OR
        public.has_role(auth.uid(), 'perbendaharaan') OR
        public.has_role(auth.uid(), 'kepala_bkad') OR
        public.is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authorized can create revisions"
  ON public.revisi_spm FOR INSERT
  WITH CHECK (auth.uid() = revisi_by);

-- Format Nomor: All authenticated read, admins write
CREATE POLICY "All authenticated can read format nomor"
  ON public.format_nomor FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage format nomor"
  ON public.format_nomor FOR ALL
  USING (public.is_admin(auth.uid()));

-- Permissions: All authenticated read
CREATE POLICY "All authenticated can read permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permissions"
  ON public.permissions FOR ALL
  USING (public.is_admin(auth.uid()));
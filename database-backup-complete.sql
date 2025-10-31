-- ============================================================================
-- COMPLETE DATABASE SCHEMA BACKUP
-- Generated: 2025-10-31
-- System: Sistem Informasi Manajemen SPM & SP2D
-- 
-- This file contains the complete database schema including:
-- - ENUM Types
-- - Tables with all columns and constraints
-- - Database Functions (Security Definer)
-- - Triggers
-- - Row Level Security (RLS) Policies
-- - Indexes
-- - Storage Buckets Configuration
--
-- USAGE:
-- 1. Create a new PostgreSQL/Supabase database
-- 2. Run this entire SQL file
-- 3. Configure Supabase storage buckets manually (see end of file)
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

-- Drop existing enums if exists (for clean reinstall)
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.status_spm CASCADE;
DROP TYPE IF EXISTS public.status_sp2d CASCADE;
DROP TYPE IF EXISTS public.jenis_lampiran_spm CASCADE;
DROP TYPE IF EXISTS public.jenis_notifikasi CASCADE;
DROP TYPE IF EXISTS public.jenis_pajak CASCADE;

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM (
    'administrator',
    'super_admin',
    'demo_admin',
    'bendahara_opd',
    'resepsionis',
    'pbmd',
    'akuntansi',
    'perbendaharaan',
    'kepala_bkad',
    'kuasa_bud'
);

-- Create status_spm enum
CREATE TYPE public.status_spm AS ENUM (
    'draft',
    'diajukan',
    'resepsionis_verifikasi',
    'pbmd_verifikasi',
    'akuntansi_validasi',
    'perbendaharaan_verifikasi',
    'kepala_bkad_review',
    'disetujui',
    'perlu_revisi',
    'ditolak'
);

-- Create status_sp2d enum
CREATE TYPE public.status_sp2d AS ENUM (
    'draft',
    'diterbitkan',
    'verifikasi',
    'dikirim_bank',
    'dikonfirmasi_bank',
    'dicairkan',
    'gagal'
);

-- Create jenis_lampiran_spm enum
CREATE TYPE public.jenis_lampiran_spm AS ENUM (
    'dokumen_spm',
    'tbk',
    'spj',
    'lainnya'
);

-- Create jenis_notifikasi enum
CREATE TYPE public.jenis_notifikasi AS ENUM (
    'spm_diajukan',
    'spm_diverifikasi',
    'spm_ditolak',
    'spm_perlu_revisi',
    'spm_disetujui',
    'sp2d_diterbitkan',
    'pin_verification',
    'otp_verification',
    'info_sistem'
);

-- Create jenis_pajak enum
CREATE TYPE public.jenis_pajak AS ENUM (
    'PPh21',
    'PPh22',
    'PPh23',
    'PPh4(2)',
    'PPN'
);

-- ============================================================================
-- SECTION 2: DATABASE FUNCTIONS
-- ============================================================================

-- Function: month_to_roman
CREATE OR REPLACE FUNCTION public.month_to_roman(month_num integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE month_num
    WHEN 1 THEN 'I'
    WHEN 2 THEN 'II'
    WHEN 3 THEN 'III'
    WHEN 4 THEN 'IV'
    WHEN 5 THEN 'V'
    WHEN 6 THEN 'VI'
    WHEN 7 THEN 'VII'
    WHEN 8 THEN 'VIII'
    WHEN 9 THEN 'IX'
    WHEN 10 THEN 'X'
    WHEN 11 THEN 'XI'
    WHEN 12 THEN 'XII'
    ELSE 'I'
  END;
END;
$$;

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function: has_role_text
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text = _role
  );
$$;

-- Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('administrator', 'kepala_bkad')
  )
$$;

-- Function: can_write
CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('administrator', 'kepala_bkad')
  ) 
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role::text = 'demo_admin'
  )
$$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: generate_document_number
CREATE OR REPLACE FUNCTION public.generate_document_number(_jenis_dokumen text, _tanggal timestamp with time zone DEFAULT now())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _format text;
  _counter integer;
  _tahun integer;
  _bulan integer;
  _tanggal_str text;
  _nomor_final text;
  _counter_str text;
BEGIN
  -- Extract year and month from date
  _tahun := EXTRACT(YEAR FROM _tanggal);
  _bulan := EXTRACT(MONTH FROM _tanggal);
  
  -- Format date as ddMMyy
  _tanggal_str := to_char(_tanggal, 'DDMMYY');
  
  -- Lock and get format_nomor row for this document type and year
  SELECT format, counter + 1
  INTO _format, _counter
  FROM format_nomor
  WHERE jenis_dokumen = _jenis_dokumen 
    AND tahun = _tahun
  FOR UPDATE;
  
  -- If no format exists, raise error
  IF _format IS NULL THEN
    RAISE EXCEPTION 'Format nomor untuk % tahun % belum dikonfigurasi', _jenis_dokumen, _tahun;
  END IF;
  
  -- Update counter
  UPDATE format_nomor
  SET counter = _counter, updated_at = now()
  WHERE jenis_dokumen = _jenis_dokumen 
    AND tahun = _tahun;
  
  -- Build the number string with zero padding (3 digits)
  _counter_str := LPAD(_counter::text, 3, '0');
  
  -- Replace placeholders in format
  _nomor_final := _format;
  _nomor_final := REPLACE(_nomor_final, '{nomor}', _counter_str);
  _nomor_final := REPLACE(_nomor_final, '{tahun}', _tahun::text);
  _nomor_final := REPLACE(_nomor_final, '{bulan}', LPAD(_bulan::text, 2, '0'));
  _nomor_final := REPLACE(_nomor_final, '{romawi_bulan}', month_to_roman(_bulan));
  _nomor_final := REPLACE(_nomor_final, '{tanggal}', _tanggal_str);
  
  RETURN _nomor_final;
END;
$$;

-- Function: recalculate_spm_totals
CREATE OR REPLACE FUNCTION public.recalculate_spm_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE spm
  SET 
    total_potongan = (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM potongan_pajak_spm
      WHERE spm_id = COALESCE(NEW.spm_id, OLD.spm_id)
    ),
    nilai_bersih = nilai_spm - (
      SELECT COALESCE(SUM(jumlah_pajak), 0)
      FROM potongan_pajak_spm
      WHERE spm_id = COALESCE(NEW.spm_id, OLD.spm_id)
    )
  WHERE id = COALESCE(NEW.spm_id, OLD.spm_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: update_spm_nilai_bersih
CREATE OR REPLACE FUNCTION public.update_spm_nilai_bersih()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.nilai_bersih = NEW.nilai_spm - COALESCE(NEW.total_potongan, 0);
  RETURN NEW;
END;
$$;

-- Function: recalculate_sp2d_totals
CREATE OR REPLACE FUNCTION public.recalculate_sp2d_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Function: audit_master_data_changes
CREATE OR REPLACE FUNCTION public.audit_master_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
  END IF;

  INSERT INTO public.audit_log (
    user_id,
    action,
    resource,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    _user_id,
    _action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: audit_spm_changes
CREATE OR REPLACE FUNCTION public.audit_spm_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
    _user_id := NEW.bendahara_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
    -- Determine which user made the change based on status change
    IF (OLD.status != NEW.status) THEN
      CASE NEW.status
        WHEN 'resepsionis_verifikasi' THEN _user_id := NEW.verified_by_resepsionis;
        WHEN 'pbmd_verifikasi' THEN _user_id := NEW.verified_by_pbmd;
        WHEN 'akuntansi_validasi' THEN _user_id := NEW.verified_by_akuntansi;
        WHEN 'perbendaharaan_verifikasi' THEN _user_id := NEW.verified_by_perbendaharaan;
        WHEN 'kepala_bkad_review', 'disetujui' THEN _user_id := NEW.verified_by_kepala_bkad;
        ELSE _user_id := NEW.bendahara_id;
      END CASE;
    ELSE
      _user_id := NEW.bendahara_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
    _user_id := OLD.bendahara_id;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_log (
    user_id,
    action,
    resource,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    _user_id,
    _action,
    'spm',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: audit_sp2d_changes
CREATE OR REPLACE FUNCTION public.audit_sp2d_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _action text;
  _user_id uuid;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    _action := 'create';
    _user_id := NEW.created_by;
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'update';
    -- If status changed to approved/rejected (diterbitkan/gagal), user is the verifier
    IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status::text IN ('diterbitkan', 'gagal')) THEN
      _user_id := NEW.verified_by;
    ELSE
      _user_id := COALESCE(NEW.verified_by, NEW.created_by);
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'delete';
    _user_id := OLD.created_by;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_log (
    user_id,
    action,
    resource,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    _user_id,
    _action,
    'sp2d',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: assign_spm_number
CREATE OR REPLACE FUNCTION public.assign_spm_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only assign number if status is 'diajukan' and nomor_spm is NULL or empty
  -- This allows manual nomor_spm to be preserved
  IF NEW.status = 'diajukan' AND (NEW.nomor_spm IS NULL OR NEW.nomor_spm = '') THEN
    NEW.nomor_spm := generate_document_number('spm', COALESCE(NEW.tanggal_ajuan, now()));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: assign_verification_numbers
CREATE OR REPLACE FUNCTION public.assign_verification_numbers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only assign numbers when status changes to resepsionis_verifikasi
  -- and the numbers are not already set
  IF NEW.status = 'resepsionis_verifikasi' AND OLD.status = 'diajukan' THEN
    -- Generate nomor_antrian if not set
    IF NEW.nomor_antrian IS NULL THEN
      NEW.nomor_antrian := generate_document_number('antrian_spm', COALESCE(NEW.tanggal_resepsionis, now()));
    END IF;
    
    -- Generate nomor_berkas if not set
    IF NEW.nomor_berkas IS NULL THEN
      NEW.nomor_berkas := generate_document_number('berkas_spm', COALESCE(NEW.tanggal_resepsionis, now()));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: sync_file_sizes
CREATE OR REPLACE FUNCTION public.sync_file_sizes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.key = 'max_file_size' AND NEW.value IS DISTINCT FROM OLD.value THEN
    UPDATE config_sistem 
    SET value = NEW.value, updated_at = now()
    WHERE key IN (
      'max_file_size_dokumen_spm',
      'max_file_size_tbk', 
      'max_file_size_spj',
      'max_file_size_lainnya'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function: check_opd_dependencies
CREATE OR REPLACE FUNCTION public.check_opd_dependencies(opd_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count integer;
  spm_count integer;
  pejabat_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM public.user_roles
  WHERE opd_id = opd_id_param;
  
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE opd_id = opd_id_param;
  
  SELECT COUNT(*) INTO pejabat_count
  FROM public.pejabat
  WHERE opd_id = opd_id_param AND is_active = true;
  
  result := jsonb_build_object(
    'user_count', user_count,
    'spm_count', spm_count,
    'pejabat_count', pejabat_count,
    'can_deactivate', (user_count = 0 AND spm_count = 0 AND pejabat_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function: check_jenis_spm_dependencies
CREATE OR REPLACE FUNCTION public.check_jenis_spm_dependencies(jenis_spm_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE jenis_spm_id = jenis_spm_id_param;
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'can_deactivate', (spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function: check_vendor_dependencies
CREATE OR REPLACE FUNCTION public.check_vendor_dependencies(vendor_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  spm_count integer;
  result jsonb;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM public.spm
  WHERE vendor_id = vendor_id_param;
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'can_deactivate', (spm_count = 0)
  );
  
  RETURN result;
END;
$$;

-- Function: check_pajak_dependencies
CREATE OR REPLACE FUNCTION public.check_pajak_dependencies(pajak_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  spm_count INTEGER;
  sp2d_count INTEGER;
  result JSONB;
BEGIN
  SELECT COUNT(*) INTO spm_count
  FROM potongan_pajak_spm
  WHERE jenis_pajak = (SELECT jenis_pajak FROM master_pajak WHERE id = pajak_id_param);
  
  SELECT COUNT(*) INTO sp2d_count
  FROM potongan_pajak_sp2d
  WHERE jenis_pajak::text = (SELECT jenis_pajak FROM master_pajak WHERE id = pajak_id_param);
  
  result := jsonb_build_object(
    'spm_count', spm_count,
    'sp2d_count', sp2d_count,
    'can_deactivate', (spm_count = 0 AND sp2d_count = 0)
  );
  
  RETURN result;
END;
$$;

-- ============================================================================
-- SECTION 3: TABLES
-- ============================================================================

-- Table: profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  phone character varying,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: opd
CREATE TABLE public.opd (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_opd character varying NOT NULL,
  nama_opd text NOT NULL,
  alamat text,
  telepon character varying,
  email character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  opd_id uuid REFERENCES public.opd(id),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  UNIQUE(user_id, role)
);

-- Table: jenis_spm
CREATE TABLE public.jenis_spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_jenis text NOT NULL,
  deskripsi text,
  ada_pajak boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: master_pajak
CREATE TABLE public.master_pajak (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis_pajak character varying NOT NULL,
  kode_pajak character varying NOT NULL,
  nama_pajak text NOT NULL,
  tarif_default numeric NOT NULL,
  rekening_pajak character varying NOT NULL,
  kategori text,
  deskripsi text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: vendor
CREATE TABLE public.vendor (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_vendor text NOT NULL,
  npwp character varying,
  alamat text,
  telepon character varying,
  email character varying,
  nama_bank text,
  nomor_rekening character varying,
  nama_rekening text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: bendahara_pengeluaran
CREATE TABLE public.bendahara_pengeluaran (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_bendahara text NOT NULL,
  nip text,
  alamat text,
  telepon text,
  email text,
  nama_bank text,
  nomor_rekening text,
  nama_rekening text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: pihak_ketiga
CREATE TABLE public.pihak_ketiga (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_pihak_ketiga text NOT NULL,
  npwp text,
  alamat text,
  telepon text,
  email text,
  nama_bank text,
  nomor_rekening text,
  nama_rekening text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: spm
CREATE TABLE public.spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_spm character varying,
  nomor_antrian character varying,
  nomor_berkas character varying,
  bendahara_id uuid NOT NULL,
  opd_id uuid NOT NULL REFERENCES public.opd(id),
  jenis_spm_id uuid REFERENCES public.jenis_spm(id),
  tanggal_ajuan timestamp with time zone DEFAULT now(),
  nilai_spm numeric NOT NULL,
  total_potongan bigint DEFAULT 0,
  nilai_bersih bigint,
  uraian text,
  status status_spm,
  tipe_penerima text,
  nama_penerima text,
  nama_bank text,
  nomor_rekening text,
  nama_rekening text,
  is_aset boolean DEFAULT false,
  verified_by_resepsionis uuid,
  verified_by_pbmd uuid,
  verified_by_akuntansi uuid,
  verified_by_perbendaharaan uuid,
  verified_by_kepala_bkad uuid,
  tanggal_resepsionis timestamp with time zone,
  tanggal_pbmd timestamp with time zone,
  tanggal_akuntansi timestamp with time zone,
  tanggal_perbendaharaan timestamp with time zone,
  tanggal_kepala_bkad timestamp with time zone,
  tanggal_disetujui timestamp with time zone,
  catatan_resepsionis text,
  catatan_pbmd text,
  catatan_akuntansi text,
  catatan_perbendaharaan text,
  catatan_kepala_bkad text,
  pin_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: lampiran_spm
CREATE TABLE public.lampiran_spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spm_id uuid NOT NULL REFERENCES public.spm(id) ON DELETE CASCADE,
  jenis_lampiran jenis_lampiran_spm NOT NULL,
  nama_file text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: potongan_pajak_spm
CREATE TABLE public.potongan_pajak_spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spm_id uuid NOT NULL REFERENCES public.spm(id) ON DELETE CASCADE,
  jenis_pajak text NOT NULL,
  uraian text NOT NULL,
  dasar_pengenaan bigint NOT NULL,
  tarif numeric NOT NULL,
  jumlah_pajak bigint NOT NULL,
  rekening_pajak text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: revisi_spm
CREATE TABLE public.revisi_spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spm_id uuid NOT NULL REFERENCES public.spm(id) ON DELETE CASCADE,
  revisi_by uuid NOT NULL,
  catatan_revisi text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: sp2d
CREATE TABLE public.sp2d (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_sp2d character varying NOT NULL,
  nomor_penguji character varying,
  spm_id uuid NOT NULL REFERENCES public.spm(id),
  tanggal_sp2d timestamp with time zone DEFAULT now(),
  nilai_sp2d numeric NOT NULL,
  total_potongan numeric DEFAULT 0,
  nilai_diterima numeric,
  status status_sp2d DEFAULT 'diterbitkan',
  kuasa_bud_id uuid,
  nama_bank text,
  nomor_rekening character varying,
  nama_rekening text,
  verified_by uuid,
  created_by uuid,
  dokumen_sp2d_url text,
  ttd_digital_url text,
  tanggal_kirim_bank timestamp with time zone,
  tanggal_konfirmasi_bank timestamp with time zone,
  tanggal_cair timestamp with time zone,
  catatan text,
  otp_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: potongan_pajak_sp2d
CREATE TABLE public.potongan_pajak_sp2d (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sp2d_id uuid NOT NULL REFERENCES public.sp2d(id) ON DELETE CASCADE,
  jenis_pajak jenis_pajak NOT NULL,
  uraian text NOT NULL,
  dasar_pengenaan numeric NOT NULL,
  tarif numeric NOT NULL,
  jumlah_pajak numeric NOT NULL,
  rekening_pajak character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: notifikasi
CREATE TABLE public.notifikasi (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  jenis jenis_notifikasi NOT NULL,
  judul text NOT NULL,
  pesan text NOT NULL,
  spm_id uuid REFERENCES public.spm(id),
  is_read boolean DEFAULT false,
  sent_via_wa boolean DEFAULT false,
  wa_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: audit_log
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  is_emergency boolean DEFAULT false,
  emergency_reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: config_sistem
CREATE TABLE public.config_sistem (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: format_nomor
CREATE TABLE public.format_nomor (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis_dokumen text NOT NULL,
  tahun integer NOT NULL,
  format text NOT NULL,
  counter integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(jenis_dokumen, tahun)
);

-- Table: pin_otp
CREATE TABLE public.pin_otp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  jenis text NOT NULL,
  kode_hash text NOT NULL,
  spm_id uuid REFERENCES public.spm(id),
  sp2d_id uuid REFERENCES public.sp2d(id),
  expires_at timestamp with time zone NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public_token
CREATE TABLE public.public_token (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token character varying NOT NULL UNIQUE,
  spm_id uuid NOT NULL REFERENCES public.spm(id),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: pejabat
CREATE TABLE public.pejabat (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nip character varying NOT NULL,
  nama_lengkap text NOT NULL,
  jabatan text NOT NULL,
  opd_id uuid REFERENCES public.opd(id),
  ttd_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: template_surat
CREATE TABLE public.template_surat (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_template text NOT NULL,
  jenis_surat text NOT NULL,
  konten_html text NOT NULL,
  variables jsonb,
  kop_surat_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: permissions
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  resource text NOT NULL,
  can_create boolean DEFAULT false,
  can_read boolean DEFAULT false,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, resource)
);

-- Table: email_config
CREATE TABLE public.email_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host text NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_user text NOT NULL,
  smtp_password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL,
  is_active boolean DEFAULT false,
  test_status text,
  last_test_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: wa_gateway
CREATE TABLE public.wa_gateway (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id text NOT NULL,
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  test_status text,
  last_test_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: panduan_manual
CREATE TABLE public.panduan_manual (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  judul text NOT NULL,
  konten text NOT NULL,
  urutan integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: pajak_per_jenis_spm
CREATE TABLE public.pajak_per_jenis_spm (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis_spm text NOT NULL,
  master_pajak_id uuid NOT NULL REFERENCES public.master_pajak(id),
  uraian_template text,
  is_default boolean DEFAULT true,
  urutan integer DEFAULT 1,
  deskripsi text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: dashboard_layout
CREATE TABLE public.dashboard_layout (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  layout_config jsonb NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: TRIGGERS
-- ============================================================================

-- Trigger on auth.users for handle_new_user
-- Note: This requires access to auth schema, which may need manual setup
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update_updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_updated_at on opd
CREATE TRIGGER update_opd_updated_at
  BEFORE UPDATE ON public.opd
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_updated_at on jenis_spm
CREATE TRIGGER update_jenis_spm_updated_at
  BEFORE UPDATE ON public.jenis_spm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_updated_at on master_pajak
CREATE TRIGGER update_master_pajak_updated_at
  BEFORE UPDATE ON public.master_pajak
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_updated_at on vendor
CREATE TRIGGER update_vendor_updated_at
  BEFORE UPDATE ON public.vendor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: assign_spm_number on spm
CREATE TRIGGER assign_spm_number_trigger
  BEFORE INSERT OR UPDATE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_spm_number();

-- Trigger: assign_verification_numbers on spm
CREATE TRIGGER assign_verification_numbers_trigger
  BEFORE UPDATE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_verification_numbers();

-- Trigger: update_spm_nilai_bersih on spm
CREATE TRIGGER update_spm_nilai_bersih_trigger
  BEFORE INSERT OR UPDATE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spm_nilai_bersih();

-- Trigger: audit_spm_changes on spm
CREATE TRIGGER audit_spm_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_spm_changes();

-- Trigger: update_updated_at on spm
CREATE TRIGGER update_spm_updated_at
  BEFORE UPDATE ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: recalculate_spm_totals on potongan_pajak_spm
CREATE TRIGGER recalculate_spm_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.potongan_pajak_spm
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_spm_totals();

-- Trigger: audit_sp2d_changes on sp2d
CREATE TRIGGER audit_sp2d_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sp2d
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sp2d_changes();

-- Trigger: update_updated_at on sp2d
CREATE TRIGGER update_sp2d_updated_at
  BEFORE UPDATE ON public.sp2d
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: recalculate_sp2d_totals on potongan_pajak_sp2d
CREATE TRIGGER recalculate_sp2d_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.potongan_pajak_sp2d
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_sp2d_totals();

-- Trigger: sync_file_sizes on config_sistem
CREATE TRIGGER sync_file_sizes_trigger
  AFTER UPDATE ON public.config_sistem
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_file_sizes();

-- Trigger: audit_master_data_changes on opd
CREATE TRIGGER audit_opd_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.opd
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_master_data_changes();

-- Trigger: audit_master_data_changes on vendor
CREATE TRIGGER audit_vendor_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_master_data_changes();

-- Trigger: audit_master_data_changes on jenis_spm
CREATE TRIGGER audit_jenis_spm_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.jenis_spm
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_master_data_changes();

-- Trigger: audit_master_data_changes on master_pajak
CREATE TRIGGER audit_master_pajak_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.master_pajak
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_master_data_changes();

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_pajak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bendahara_pengeluaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pihak_ketiga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampiran_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potongan_pajak_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisi_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sp2d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potongan_pajak_sp2d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_sistem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.format_nomor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pejabat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_gateway ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panduan_manual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pajak_per_jenis_spm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (can_write(auth.uid())) WITH CHECK (can_write(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (can_write(auth.uid()));

CREATE POLICY "Users can view profiles for SP2D/SPM context" ON public.profiles
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM spm WHERE spm.bendahara_id = profiles.id)) OR
    (EXISTS (SELECT 1 FROM sp2d WHERE sp2d.created_by = profiles.id OR sp2d.verified_by = profiles.id)) OR
    (auth.uid() = id) OR
    is_admin(auth.uid())
  );

-- Policies for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (can_write(auth.uid())) WITH CHECK (can_write(auth.uid()));

-- Policies for opd table
CREATE POLICY "All authenticated can read OPD" ON public.opd
  FOR SELECT USING (true);

CREATE POLICY "Admins and Akuntansi can create OPD" ON public.opd
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Admins and Akuntansi can update OPD" ON public.opd
  FOR UPDATE USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Only super admin can delete OPD" ON public.opd
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- Policies for jenis_spm table
CREATE POLICY "All authenticated can read jenis_spm" ON public.jenis_spm
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage jenis_spm" ON public.jenis_spm
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Policies for master_pajak table
CREATE POLICY "All authenticated can read master_pajak" ON public.master_pajak
  FOR SELECT USING (true);

CREATE POLICY "Admins and Akuntansi can create master_pajak" ON public.master_pajak
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Admins and Akuntansi can update master_pajak" ON public.master_pajak
  FOR UPDATE USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'));

CREATE POLICY "Only super admin can delete master_pajak" ON public.master_pajak
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- Policies for vendor table
CREATE POLICY "All authenticated can read vendor" ON public.vendor
  FOR SELECT USING (true);

CREATE POLICY "Admins, Akuntansi, and Bendahara can create vendor" ON public.vendor
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi') OR has_role(auth.uid(), 'bendahara_opd'));

CREATE POLICY "Admins, Akuntansi, and Bendahara can update vendor" ON public.vendor
  FOR UPDATE USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi') OR has_role(auth.uid(), 'bendahara_opd'))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi') OR has_role(auth.uid(), 'bendahara_opd'));

CREATE POLICY "Only super admin can delete vendor" ON public.vendor
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- Policies for bendahara_pengeluaran table
CREATE POLICY "Users can view bendahara_pengeluaran" ON public.bendahara_pengeluaran
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create bendahara_pengeluaran" ON public.bendahara_pengeluaran
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update bendahara_pengeluaran" ON public.bendahara_pengeluaran
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete bendahara_pengeluaran" ON public.bendahara_pengeluaran
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for pihak_ketiga table
CREATE POLICY "Users can view pihak_ketiga" ON public.pihak_ketiga
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create pihak_ketiga" ON public.pihak_ketiga
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update pihak_ketiga" ON public.pihak_ketiga
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete pihak_ketiga" ON public.pihak_ketiga
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for spm table
CREATE POLICY "Authenticated users can view all SPM" ON public.spm
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert SPM" ON public.spm
  FOR INSERT WITH CHECK (auth.uid() = bendahara_id);

CREATE POLICY "Bendahara can create own SPM" ON public.spm
  FOR INSERT WITH CHECK (
    ((auth.uid() = bendahara_id) AND has_role(auth.uid(), 'bendahara_opd')) OR
    is_admin(auth.uid())
  );

CREATE POLICY "Bendahara can update their SPM" ON public.spm
  FOR UPDATE USING (
    (auth.uid() = bendahara_id) AND 
    (status IN ('draft', 'perlu_revisi'))
  )
  WITH CHECK (
    (auth.uid() = bendahara_id) AND 
    (status IN ('draft', 'perlu_revisi'))
  );

CREATE POLICY "Bendahara can delete draft SPM" ON public.spm
  FOR DELETE USING ((auth.uid() = bendahara_id) AND (status = 'draft'));

CREATE POLICY "Authorized users can update SPM" ON public.spm
  FOR UPDATE USING (
    ((auth.uid() = bendahara_id) AND (status = 'draft')) OR
    has_role(auth.uid(), 'resepsionis') OR
    has_role(auth.uid(), 'pbmd') OR
    has_role(auth.uid(), 'akuntansi') OR
    has_role(auth.uid(), 'perbendaharaan') OR
    has_role(auth.uid(), 'kepala_bkad') OR
    is_admin(auth.uid())
  );

CREATE POLICY "Verifiers can update SPM status" ON public.spm
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can view SPM for reports" ON public.spm
  FOR SELECT USING (
    (auth.uid() = bendahara_id) OR
    has_role(auth.uid(), 'resepsionis') OR
    has_role(auth.uid(), 'pbmd') OR
    has_role(auth.uid(), 'akuntansi') OR
    has_role(auth.uid(), 'perbendaharaan') OR
    has_role(auth.uid(), 'kepala_bkad') OR
    has_role(auth.uid(), 'kuasa_bud') OR
    is_admin(auth.uid()) OR
    (has_role(auth.uid(), 'bendahara_opd') AND 
     EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.opd_id = spm.opd_id))
  );

-- Policies for lampiran_spm table
CREATE POLICY "Users can view SPM attachments" ON public.lampiran_spm
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spm 
      WHERE spm.id = lampiran_spm.spm_id AND (
        auth.uid() = spm.bendahara_id OR
        has_role(auth.uid(), 'resepsionis') OR
        has_role(auth.uid(), 'pbmd') OR
        has_role(auth.uid(), 'akuntansi') OR
        has_role(auth.uid(), 'perbendaharaan') OR
        has_role(auth.uid(), 'kepala_bkad') OR
        has_role(auth.uid(), 'kuasa_bud') OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Bendahara can upload attachments" ON public.lampiran_spm
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Policies for potongan_pajak_spm table
CREATE POLICY "Users can view SPM tax deductions" ON public.potongan_pajak_spm
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spm 
      WHERE spm.id = potongan_pajak_spm.spm_id AND (
        auth.uid() = spm.bendahara_id OR
        has_role(auth.uid(), 'resepsionis') OR
        has_role(auth.uid(), 'pbmd') OR
        has_role(auth.uid(), 'akuntansi') OR
        has_role(auth.uid(), 'perbendaharaan') OR
        has_role(auth.uid(), 'kepala_bkad') OR
        has_role(auth.uid(), 'kuasa_bud') OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Bendahara can manage own draft SPM tax deductions" ON public.potongan_pajak_spm
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM spm 
      WHERE spm.id = potongan_pajak_spm.spm_id AND
      auth.uid() = spm.bendahara_id AND
      spm.status = 'draft'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spm 
      WHERE spm.id = potongan_pajak_spm.spm_id AND
      auth.uid() = spm.bendahara_id AND
      spm.status = 'draft'
    )
  );

CREATE POLICY "Admins can manage all tax deductions" ON public.potongan_pajak_spm
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Policies for revisi_spm table
CREATE POLICY "Users can view SPM revisions" ON public.revisi_spm
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spm 
      WHERE spm.id = revisi_spm.spm_id AND (
        auth.uid() = spm.bendahara_id OR
        has_role(auth.uid(), 'resepsionis') OR
        has_role(auth.uid(), 'pbmd') OR
        has_role(auth.uid(), 'akuntansi') OR
        has_role(auth.uid(), 'perbendaharaan') OR
        has_role(auth.uid(), 'kepala_bkad') OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Authorized can create revisions" ON public.revisi_spm
  FOR INSERT WITH CHECK (auth.uid() = revisi_by);

-- Policies for sp2d table
CREATE POLICY "Authorized can view SP2D" ON public.sp2d
  FOR SELECT USING (
    has_role(auth.uid(), 'kuasa_bud') OR
    has_role(auth.uid(), 'kepala_bkad') OR
    is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM spm WHERE spm.id = sp2d.spm_id AND auth.uid() = spm.bendahara_id)
  );

CREATE POLICY "Kuasa BUD can manage SP2D" ON public.sp2d
  FOR ALL USING (has_role(auth.uid(), 'kuasa_bud') OR is_admin(auth.uid()));

-- Policies for potongan_pajak_sp2d table
CREATE POLICY "Authorized can view tax deductions" ON public.potongan_pajak_sp2d
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sp2d 
      WHERE sp2d.id = potongan_pajak_sp2d.sp2d_id AND (
        has_role(auth.uid(), 'kuasa_bud') OR
        has_role(auth.uid(), 'kepala_bkad') OR
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Kuasa BUD can manage tax deductions" ON public.potongan_pajak_sp2d
  FOR ALL USING (has_role(auth.uid(), 'kuasa_bud') OR is_admin(auth.uid()));

-- Policies for notifikasi table
CREATE POLICY "Users can view own notifications" ON public.notifikasi
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifikasi
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifikasi
  FOR INSERT WITH CHECK (true);

-- Policies for audit_log table
CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Policies for config_sistem table
CREATE POLICY "Admins can manage config" ON public.config_sistem
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public can read sidebar template" ON public.config_sistem
  FOR SELECT USING (key = 'sidebar_template');

CREATE POLICY "Super admin can manage emergency mode" ON public.config_sistem
  FOR UPDATE USING (
    (key LIKE 'emergency_mode%') AND 
    has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (key LIKE 'emergency_mode%') AND 
    has_role(auth.uid(), 'super_admin')
  );

-- Policies for format_nomor table
CREATE POLICY "All authenticated can read format nomor" ON public.format_nomor
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage format nomor" ON public.format_nomor
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for pin_otp table
CREATE POLICY "Users can view own PIN/OTP" ON public.pin_otp
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create PIN/OTP" ON public.pin_otp
  FOR INSERT WITH CHECK (true);

-- Policies for public_token table
CREATE POLICY "Public can read valid tokens" ON public.public_token
  FOR SELECT USING ((expires_at IS NULL) OR (expires_at > now()));

-- Policies for pejabat table
CREATE POLICY "All authenticated can read pejabat" ON public.pejabat
  FOR SELECT USING (true);

CREATE POLICY "Admins can create pejabat" ON public.pejabat
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update pejabat" ON public.pejabat
  FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only super admin can delete pejabat" ON public.pejabat
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- Policies for template_surat table
CREATE POLICY "All authenticated can read templates" ON public.template_surat
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.template_surat
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for permissions table
CREATE POLICY "All authenticated can read permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for email_config table
CREATE POLICY "Admins can manage email config" ON public.email_config
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for wa_gateway table
CREATE POLICY "Admins can manage WA Gateway" ON public.wa_gateway
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for panduan_manual table
CREATE POLICY "Users can view guides for their roles" ON public.panduan_manual
  FOR SELECT USING (has_role(auth.uid(), role) OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage guides" ON public.panduan_manual
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Policies for pajak_per_jenis_spm table
CREATE POLICY "All authenticated can read pajak_per_jenis_spm" ON public.pajak_per_jenis_spm
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pajak_per_jenis_spm" ON public.pajak_per_jenis_spm
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Policies for dashboard_layout table
CREATE POLICY "Users can manage own dashboard layout" ON public.dashboard_layout
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all dashboard layouts" ON public.dashboard_layout
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "select_own_or_default_dashboard_layout" ON public.dashboard_layout
  FOR SELECT USING ((user_id = auth.uid()) OR (is_default = true));

CREATE POLICY "upsert_own_dashboard_layout" ON public.dashboard_layout
  FOR INSERT WITH CHECK (
    (user_id = auth.uid()) AND 
    ((is_default = false) OR has_role_text(auth.uid(), 'super_admin'))
  );

CREATE POLICY "update_own_dashboard_layout" ON public.dashboard_layout
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    (user_id = auth.uid()) AND 
    ((is_default = false) OR has_role_text(auth.uid(), 'super_admin'))
  );

-- ============================================================================
-- SECTION 6: INDEXES
-- ============================================================================

-- Indexes for performance optimization
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_opd_id ON public.user_roles(opd_id);

CREATE INDEX idx_spm_bendahara_id ON public.spm(bendahara_id);
CREATE INDEX idx_spm_opd_id ON public.spm(opd_id);
CREATE INDEX idx_spm_status ON public.spm(status);
CREATE INDEX idx_spm_tanggal_ajuan ON public.spm(tanggal_ajuan);
CREATE INDEX idx_spm_jenis_spm_id ON public.spm(jenis_spm_id);

CREATE INDEX idx_lampiran_spm_spm_id ON public.lampiran_spm(spm_id);
CREATE INDEX idx_potongan_pajak_spm_spm_id ON public.potongan_pajak_spm(spm_id);
CREATE INDEX idx_revisi_spm_spm_id ON public.revisi_spm(spm_id);

CREATE INDEX idx_sp2d_spm_id ON public.sp2d(spm_id);
CREATE INDEX idx_sp2d_status ON public.sp2d(status);
CREATE INDEX idx_sp2d_tanggal_sp2d ON public.sp2d(tanggal_sp2d);
CREATE INDEX idx_potongan_pajak_sp2d_sp2d_id ON public.potongan_pajak_sp2d(sp2d_id);

CREATE INDEX idx_notifikasi_user_id ON public.notifikasi(user_id);
CREATE INDEX idx_notifikasi_is_read ON public.notifikasi(is_read);
CREATE INDEX idx_notifikasi_created_at ON public.notifikasi(created_at);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

CREATE INDEX idx_pin_otp_user_id ON public.pin_otp(user_id);
CREATE INDEX idx_pin_otp_spm_id ON public.pin_otp(spm_id);
CREATE INDEX idx_pin_otp_sp2d_id ON public.pin_otp(sp2d_id);

-- ============================================================================
-- SECTION 7: INITIAL DATA / SEED (Optional)
-- ============================================================================

-- Insert default config_sistem values
INSERT INTO public.config_sistem (key, value, description) VALUES
  ('max_file_size', '5', 'Maximum file size in MB'),
  ('max_file_size_unit', 'MB', 'Unit for file size'),
  ('max_file_size_dokumen_spm', '5', 'Max size for SPM documents'),
  ('max_file_size_tbk', '5', 'Max size for TBK documents'),
  ('max_file_size_spj', '5', 'Max size for SPJ documents'),
  ('max_file_size_lainnya', '5', 'Max size for other documents'),
  ('emergency_mode', 'false', 'Emergency mode status'),
  ('emergency_reason', '', 'Reason for emergency mode'),
  ('sidebar_template', '[]', 'Sidebar menu template configuration')
ON CONFLICT (key) DO NOTHING;

-- Insert default format_nomor for current year
INSERT INTO public.format_nomor (jenis_dokumen, tahun, format, counter) VALUES
  ('spm', EXTRACT(YEAR FROM CURRENT_DATE)::integer, '{nomor}/SPM/{bulan}/{tahun}', 0),
  ('antrian_spm', EXTRACT(YEAR FROM CURRENT_DATE)::integer, '{nomor}/ANTRIAN/{romawi_bulan}/{tahun}', 0),
  ('berkas_spm', EXTRACT(YEAR FROM CURRENT_DATE)::integer, '{nomor}/BERKAS/{romawi_bulan}/{tahun}', 0),
  ('sp2d', EXTRACT(YEAR FROM CURRENT_DATE)::integer, '{nomor}/SP2D/{romawi_bulan}/{tahun}', 0)
ON CONFLICT (jenis_dokumen, tahun) DO NOTHING;

-- ============================================================================
-- SECTION 8: STORAGE BUCKETS CONFIGURATION
-- ============================================================================

-- Note: Storage buckets must be created manually in Supabase Dashboard or via API
-- The following buckets are required:
-- 
-- 1. Bucket: spm-documents (Public: Yes)
--    Purpose: Store SPM attachments and related documents
--    RLS Policies:
--      - SELECT: Users can view files related to SPM they have access to
--      - INSERT: Bendahara can upload files for their SPM
--      - DELETE: Bendahara can delete files from draft SPM
--
-- 2. Bucket: ttd-pejabat (Public: Yes)
--    Purpose: Store official signatures of government officials
--    RLS Policies:
--      - SELECT: All authenticated users can view
--      - INSERT: Only admins can upload
--      - UPDATE: Only admins can replace
--      - DELETE: Only super admins can delete
--
-- 3. Bucket: kop-surat (Public: Yes)
--    Purpose: Store letterhead templates
--    RLS Policies:
--      - SELECT: All authenticated users can view
--      - INSERT: Only admins can upload
--      - UPDATE: Only admins can replace
--      - DELETE: Only admins can delete
--
-- 4. Bucket: system-logos (Public: Yes)
--    Purpose: Store system logos and branding assets
--    RLS Policies:
--      - SELECT: Public access
--      - INSERT: Only super admins
--      - UPDATE: Only super admins
--      - DELETE: Only super admins

-- ============================================================================
-- END OF BACKUP FILE
-- ============================================================================

-- RESTORE INSTRUCTIONS:
-- 1. Create a new Supabase project or PostgreSQL database
-- 2. Run this SQL file completely (psql -f database-backup-complete.sql)
-- 3. Configure storage buckets manually via Supabase Dashboard
-- 4. Set up authentication triggers (auth.users trigger for handle_new_user)
-- 5. Create first super_admin user and assign role manually
-- 6. Test all RLS policies and permissions
-- 7. Configure SMTP and WhatsApp Gateway credentials
-- 8. Review and adjust format_nomor counters if needed
-- 
-- For production deployment:
-- - Review all security policies
-- - Set appropriate connection limits
-- - Configure backup schedule
-- - Monitor performance and add indexes as needed
-- - Set up monitoring and alerting
-- 
-- Last updated: 2025-10-31
-- System version: 1.0
-- ============================================================================

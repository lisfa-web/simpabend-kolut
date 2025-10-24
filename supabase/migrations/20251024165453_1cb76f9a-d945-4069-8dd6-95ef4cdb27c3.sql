-- Update RLS policies for master data tables to allow regular admins to soft delete (UPDATE)
-- and only super admins to hard delete (DELETE)

-- ============================================
-- OPD TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and Akuntansi can manage OPD" ON public.opd;

-- Allow admins and akuntansi to soft delete (UPDATE for is_active)
CREATE POLICY "Admins and Akuntansi can update OPD"
ON public.opd
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

-- Allow admins and akuntansi to create OPD
CREATE POLICY "Admins and Akuntansi can create OPD"
ON public.opd
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

-- Only super admin can hard delete (DELETE)
CREATE POLICY "Only super admin can delete OPD"
ON public.opd
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================
-- VENDOR TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins and Akuntansi can manage vendor" ON public.vendor;

CREATE POLICY "Admins and Akuntansi can update vendor"
ON public.vendor
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Admins and Akuntansi can create vendor"
ON public.vendor
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Only super admin can delete vendor"
ON public.vendor
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================
-- PROGRAM TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins and Akuntansi can manage program" ON public.program;

CREATE POLICY "Admins and Akuntansi can update program"
ON public.program
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Admins and Akuntansi can create program"
ON public.program
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Only super admin can delete program"
ON public.program
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================
-- KEGIATAN TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins and Akuntansi can manage kegiatan" ON public.kegiatan;

CREATE POLICY "Admins and Akuntansi can update kegiatan"
ON public.kegiatan
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Admins and Akuntansi can create kegiatan"
ON public.kegiatan
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Only super admin can delete kegiatan"
ON public.kegiatan
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================
-- SUBKEGIATAN TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins and Akuntansi can manage subkegiatan" ON public.subkegiatan;

CREATE POLICY "Admins and Akuntansi can update subkegiatan"
ON public.subkegiatan
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Admins and Akuntansi can create subkegiatan"
ON public.subkegiatan
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'akuntansi'::app_role)
);

CREATE POLICY "Only super admin can delete subkegiatan"
ON public.subkegiatan
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================
-- PEJABAT TABLE POLICIES (for consistency)
-- ============================================

DROP POLICY IF EXISTS "Admins can manage pejabat" ON public.pejabat;

CREATE POLICY "Admins can update pejabat"
ON public.pejabat
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Admins can create pejabat"
ON public.pejabat
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Only super admin can delete pejabat"
ON public.pejabat
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);
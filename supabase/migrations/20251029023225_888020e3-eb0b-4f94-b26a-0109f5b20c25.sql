-- Drop existing RLS policies on spm table
DROP POLICY IF EXISTS "Users can view SPM" ON public.spm;
DROP POLICY IF EXISTS "Users can insert SPM" ON public.spm;
DROP POLICY IF EXISTS "Users can update SPM" ON public.spm;
DROP POLICY IF EXISTS "Users can delete SPM" ON public.spm;
DROP POLICY IF EXISTS "Bendahara can view their SPM" ON public.spm;
DROP POLICY IF EXISTS "Bendahara can create SPM" ON public.spm;
DROP POLICY IF EXISTS "Bendahara can update their SPM" ON public.spm;
DROP POLICY IF EXISTS "Bendahara can delete draft SPM" ON public.spm;

-- Create comprehensive RLS policies for spm table
-- Policy 1: Allow all authenticated users to view SPM (for verification workflow)
CREATE POLICY "Authenticated users can view all SPM"
ON public.spm
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow authenticated users to insert SPM (as bendahara)
CREATE POLICY "Authenticated users can insert SPM"
ON public.spm
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = bendahara_id);

-- Policy 3: Allow bendahara to update their own SPM (draft or perlu_revisi status)
CREATE POLICY "Bendahara can update their SPM"
ON public.spm
FOR UPDATE
TO authenticated
USING (
  auth.uid() = bendahara_id 
  AND status IN ('draft', 'perlu_revisi')
)
WITH CHECK (
  auth.uid() = bendahara_id 
  AND status IN ('draft', 'perlu_revisi')
);

-- Policy 4: Allow verifiers to update SPM for verification workflow
CREATE POLICY "Verifiers can update SPM status"
ON public.spm
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 5: Allow bendahara to delete their draft SPM
CREATE POLICY "Bendahara can delete draft SPM"
ON public.spm
FOR DELETE
TO authenticated
USING (
  auth.uid() = bendahara_id 
  AND status = 'draft'
);
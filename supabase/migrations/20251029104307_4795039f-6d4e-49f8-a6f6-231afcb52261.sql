-- Add RLS policy to allow reading profiles for SP2D/SPM related users
-- This allows viewing bendahara/creator/verifier names in SP2D/SPM

CREATE POLICY "Users can view profiles for SP2D/SPM context"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Allow viewing any profile that is related to SP2D/SPM as bendahara/creator/verifier
  EXISTS (
    SELECT 1 FROM public.spm 
    WHERE spm.bendahara_id = profiles.id
  )
  OR EXISTS (
    SELECT 1 FROM public.sp2d
    WHERE sp2d.created_by = profiles.id 
    OR sp2d.verified_by = profiles.id
  )
  OR auth.uid() = id  -- Can always view own profile
  OR public.is_admin(auth.uid())  -- Admins can view all
);
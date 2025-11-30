-- Drop existing SELECT policies on arsip_spm
DROP POLICY IF EXISTS "Bendahara can view own archived SPM" ON public.arsip_spm;

-- Create new policy: Bendahara can view archived SPM from their OPD
CREATE POLICY "Bendahara can view OPD archived SPM" 
ON public.arsip_spm 
FOR SELECT 
USING (
  (auth.uid() = bendahara_id) OR 
  is_admin(auth.uid()) OR
  (has_role(auth.uid(), 'bendahara_opd') AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.opd_id = arsip_spm.opd_id
  ))
);

-- Drop existing SELECT policies on arsip_sp2d
DROP POLICY IF EXISTS "Bendahara can view own archived SP2D" ON public.arsip_sp2d;

-- Create new policy: Bendahara can view archived SP2D from their OPD
CREATE POLICY "Bendahara can view OPD archived SP2D" 
ON public.arsip_sp2d 
FOR SELECT 
USING (
  (auth.uid() = bendahara_id) OR 
  is_admin(auth.uid()) OR
  (has_role(auth.uid(), 'bendahara_opd') AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.opd_id = arsip_sp2d.opd_id
  ))
);
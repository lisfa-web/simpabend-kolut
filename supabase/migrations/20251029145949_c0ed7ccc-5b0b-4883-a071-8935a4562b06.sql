-- Update vendor INSERT policy to allow bendahara_opd role
DROP POLICY IF EXISTS "Admins and Akuntansi can create vendor" ON vendor;

CREATE POLICY "Admins, Akuntansi, and Bendahara can create vendor"
ON vendor
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'akuntansi'::app_role)
  OR has_role(auth.uid(), 'bendahara_opd'::app_role)
);

-- Update vendor UPDATE policy to allow bendahara_opd role
DROP POLICY IF EXISTS "Admins and Akuntansi can update vendor" ON vendor;

CREATE POLICY "Admins, Akuntansi, and Bendahara can update vendor"
ON vendor
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'akuntansi'::app_role)
  OR has_role(auth.uid(), 'bendahara_opd'::app_role)
)
WITH CHECK (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'akuntansi'::app_role)
  OR has_role(auth.uid(), 'bendahara_opd'::app_role)
);
-- Update RLS policy untuk memungkinkan administrator membuat SPM
drop policy if exists "Bendahara can create own SPM" on public.spm;

create policy "Bendahara can create own SPM"
on public.spm
for insert
to authenticated
with check (
  (auth.uid() = bendahara_id and has_role(auth.uid(), 'bendahara_opd'))
  or is_admin(auth.uid())
);
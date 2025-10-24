-- Rewire audit_log.user_id foreign key to public.profiles(id) so embedding works
ALTER TABLE public.audit_log
DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;

ALTER TABLE public.audit_log
ADD CONSTRAINT audit_log_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
-- Fix audit_sp2d_changes to use valid status values and avoid enum cast errors
CREATE OR REPLACE FUNCTION public.audit_sp2d_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
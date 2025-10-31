-- Fix get_database_schema function - correct column name for policy command
DROP FUNCTION IF EXISTS public.get_database_schema();

CREATE OR REPLACE FUNCTION public.get_database_schema()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  enums jsonb;
  tables jsonb;
  functions jsonb;
  policies jsonb;
  indexes jsonb;
  triggers jsonb;
BEGIN
  -- Get all ENUM types
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', t.typname,
      'values', enum_vals.vals
    )
  ) INTO enums
  FROM pg_type t
  JOIN pg_namespace n ON t.typnamespace = n.oid
  LEFT JOIN LATERAL (
    SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) as vals
    FROM pg_enum e
    WHERE e.enumtypid = t.oid
  ) enum_vals ON true
  WHERE n.nspname = 'public' AND t.typtype = 'e';

  -- Get all tables with their columns
  WITH table_list AS (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ),
  table_columns AS (
    SELECT 
      c.table_name,
      jsonb_agg(
        jsonb_build_object(
          'column_name', c.column_name,
          'data_type', c.data_type,
          'is_nullable', c.is_nullable,
          'column_default', c.column_default
        ) ORDER BY c.ordinal_position
      ) as columns
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    GROUP BY c.table_name
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', tl.table_name,
      'columns', COALESCE(tc.columns, '[]'::jsonb)
    )
  ) INTO tables
  FROM table_list tl
  LEFT JOIN table_columns tc ON tl.table_name = tc.table_name;

  -- Get all functions
  SELECT jsonb_agg(
    jsonb_build_object(
      'function_name', p.proname,
      'function_definition', pg_get_functiondef(p.oid)
    )
  ) INTO functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.prokind = 'f';

  -- Get all RLS policies (FIXED: use 'cmd' not 'polcmd')
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', schemaname || '.' || tablename,
      'policy_name', policyname,
      'policy_cmd', cmd,
      'policy_qual', qual,
      'policy_with_check', with_check
    )
  ) INTO policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Get all indexes (excluding primary keys)
  SELECT jsonb_agg(
    jsonb_build_object(
      'index_name', indexname,
      'table_name', tablename,
      'index_definition', indexdef
    )
  ) INTO indexes
  FROM pg_indexes
  WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey';

  -- Get triggers information
  SELECT jsonb_agg(
    jsonb_build_object(
      'trigger_name', tgname,
      'table_name', c.relname,
      'trigger_definition', pg_get_triggerdef(t.oid)
    )
  ) INTO triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND NOT t.tgisinternal;

  -- Build final result
  result := jsonb_build_object(
    'enums', COALESCE(enums, '[]'::jsonb),
    'tables', COALESCE(tables, '[]'::jsonb),
    'functions', COALESCE(functions, '[]'::jsonb),
    'policies', COALESCE(policies, '[]'::jsonb),
    'indexes', COALESCE(indexes, '[]'::jsonb),
    'triggers', COALESCE(triggers, '[]'::jsonb),
    'generated_at', now()
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_database_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_database_schema() TO service_role;

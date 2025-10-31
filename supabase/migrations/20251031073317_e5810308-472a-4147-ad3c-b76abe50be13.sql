-- Function to extract complete database schema as JSON
-- This will be called by edge function to generate SQL backup

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
BEGIN
  -- Get all ENUM types
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', t.typname,
      'values', array_agg(e.enumlabel ORDER BY e.enumsortorder)
    )
  ) INTO enums
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_namespace n ON t.typnamespace = n.oid
  WHERE n.nspname = 'public'
  GROUP BY t.typname;

  -- Get all tables with columns
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', c.table_name,
      'columns', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
          ) ORDER BY ordinal_position
        )
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = c.table_name
      )
    )
  ) INTO tables
  FROM information_schema.tables c
  WHERE c.table_schema = 'public'
  AND c.table_type = 'BASE TABLE';

  -- Get all functions
  SELECT jsonb_agg(
    jsonb_build_object(
      'function_name', p.proname,
      'function_definition', pg_get_functiondef(p.oid)
    )
  ) INTO functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f';

  -- Get all RLS policies
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', schemaname || '.' || tablename,
      'policy_name', policyname,
      'policy_definition', pg_get_expr(polqual, polrelid),
      'policy_command', polcmd
    )
  ) INTO policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Get all indexes
  SELECT jsonb_agg(
    jsonb_build_object(
      'index_name', indexname,
      'table_name', tablename,
      'index_definition', indexdef
    )
  ) INTO indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey';

  -- Build final result
  result := jsonb_build_object(
    'enums', COALESCE(enums, '[]'::jsonb),
    'tables', COALESCE(tables, '[]'::jsonb),
    'functions', COALESCE(functions, '[]'::jsonb),
    'policies', COALESCE(policies, '[]'::jsonb),
    'indexes', COALESCE(indexes, '[]'::jsonb),
    'generated_at', now()
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated users (edge function will use service role)
GRANT EXECUTE ON FUNCTION public.get_database_schema() TO authenticated;

COMMENT ON FUNCTION public.get_database_schema() IS 'Extract complete database schema for backup generation';

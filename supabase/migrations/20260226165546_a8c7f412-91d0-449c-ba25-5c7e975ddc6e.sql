
CREATE OR REPLACE FUNCTION public.get_database_schema()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  enums jsonb;
  tables jsonb;
  functions jsonb;
  policies jsonb;
  indexes jsonb;
  triggers jsonb;
  constraints jsonb;
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

  -- Get all tables with their columns (with proper enum type resolution)
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
          'data_type', CASE 
            WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name
            WHEN c.data_type = 'ARRAY' THEN c.udt_name
            ELSE c.data_type
          END,
          'is_nullable', c.is_nullable,
          'column_default', c.column_default,
          'character_maximum_length', c.character_maximum_length,
          'numeric_precision', c.numeric_precision
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

  -- Get all constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE)
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', tc.table_name,
      'constraint_name', tc.constraint_name,
      'constraint_type', tc.constraint_type,
      'column_names', col_info.columns,
      'foreign_table', ccu.table_name,
      'foreign_columns', ccu_cols.columns
    )
  ) INTO constraints
  FROM information_schema.table_constraints tc
  LEFT JOIN LATERAL (
    SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns
    FROM information_schema.key_column_usage kcu
    WHERE kcu.constraint_name = tc.constraint_name 
      AND kcu.table_schema = tc.table_schema
  ) col_info ON true
  LEFT JOIN LATERAL (
    SELECT DISTINCT ccu2.table_name
    FROM information_schema.constraint_column_usage ccu2
    WHERE ccu2.constraint_name = tc.constraint_name
      AND ccu2.table_schema = tc.table_schema
      AND tc.constraint_type = 'FOREIGN KEY'
    LIMIT 1
  ) ccu ON true
  LEFT JOIN LATERAL (
    SELECT array_agg(ccu3.column_name) as columns
    FROM information_schema.constraint_column_usage ccu3
    WHERE ccu3.constraint_name = tc.constraint_name
      AND ccu3.table_schema = tc.table_schema
      AND tc.constraint_type = 'FOREIGN KEY'
  ) ccu_cols ON true
  WHERE tc.table_schema = 'public' 
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE');

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

  -- Get all RLS policies
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', schemaname || '.' || tablename,
      'policy_name', policyname,
      'policy_cmd', cmd,
      'policy_qual', qual,
      'policy_with_check', with_check,
      'permissive', permissive
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
    'constraints', COALESCE(constraints, '[]'::jsonb),
    'functions', COALESCE(functions, '[]'::jsonb),
    'policies', COALESCE(policies, '[]'::jsonb),
    'indexes', COALESCE(indexes, '[]'::jsonb),
    'triggers', COALESCE(triggers, '[]'::jsonb),
    'generated_at', now()
  );

  RETURN result;
END;
$function$;

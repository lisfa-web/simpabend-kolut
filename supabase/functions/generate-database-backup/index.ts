import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[generate-database-backup] Starting backup generation');

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call database function to get schema
    console.log('[generate-database-backup] Fetching database schema...');
    const { data: schemaData, error } = await supabase.rpc('get_database_schema');

    if (error) {
      console.error('[generate-database-backup] Error fetching schema:', error);
      throw error;
    }

    console.log('[generate-database-backup] Schema fetched successfully');
    console.log('[generate-database-backup] Enums:', schemaData.enums?.length || 0);
    console.log('[generate-database-backup] Tables:', schemaData.tables?.length || 0);
    console.log('[generate-database-backup] Functions:', schemaData.functions?.length || 0);

    // Generate SQL file content
    const sqlContent = generateSQLBackup(schemaData);

    console.log('[generate-database-backup] SQL generated, total length:', sqlContent.length);

    // Return SQL file
    return new Response(sqlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="database-backup-${new Date().toISOString().split('T')[0]}.sql"`,
      },
    });

  } catch (error) {
    console.error('[generate-database-backup] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to generate database backup'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSQLBackup(schema: any): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================================
-- COMPLETE DATABASE SCHEMA BACKUP
-- Generated: ${timestamp}
-- System: Sistem Informasi Manajemen SPM & SP2D
-- 
-- This file was automatically generated from the current database state.
-- It contains the complete database schema including:
-- - ENUM Types
-- - Tables with all columns and constraints  
-- - Database Functions
-- - Row Level Security (RLS) Policies
-- - Indexes
-- ============================================================================\n\n`;

  // Section 1: ENUM Types
  sql += `-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================\n\n`;

  if (schema.enums && schema.enums.length > 0) {
    for (const enumType of schema.enums) {
      sql += `-- Drop existing enum if exists\n`;
      sql += `DROP TYPE IF EXISTS public.${enumType.name} CASCADE;\n\n`;
      sql += `-- Create ${enumType.name} enum\n`;
      sql += `CREATE TYPE public.${enumType.name} AS ENUM (\n`;
      sql += enumType.values.map((v: string) => `  '${v}'`).join(',\n');
      sql += `\n);\n\n`;
    }
  }

  // Section 2: Tables
  sql += `-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================\n\n`;

  if (schema.tables && schema.tables.length > 0) {
    for (const table of schema.tables) {
      sql += `-- Table: ${table.table_name}\n`;
      sql += `CREATE TABLE IF NOT EXISTS public.${table.table_name} (\n`;
      
      const columns = table.columns.map((col: any) => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') colDef += ' NOT NULL';
        if (col.column_default) colDef += ` DEFAULT ${col.column_default}`;
        return colDef;
      });
      
      sql += columns.join(',\n');
      sql += `\n);\n\n`;
    }
  }

  // Section 3: Database Functions
  sql += `-- ============================================================================
-- SECTION 3: DATABASE FUNCTIONS
-- ============================================================================\n\n`;

  if (schema.functions && schema.functions.length > 0) {
    for (const func of schema.functions) {
      sql += `-- Function: ${func.function_name}\n`;
      sql += `${func.function_definition}\n\n`;
    }
  }

  // Section 4: RLS Policies
  sql += `-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================\n\n`;

  if (schema.policies && schema.policies.length > 0) {
    // Group policies by table
    const policiesByTable: Record<string, any[]> = {};
    for (const policy of schema.policies) {
      const tableName = policy.table_name;
      if (!policiesByTable[tableName]) {
        policiesByTable[tableName] = [];
      }
      policiesByTable[tableName].push(policy);
    }

    // Generate enable RLS statements
    sql += `-- Enable RLS on all tables\n`;
    for (const tableName of Object.keys(policiesByTable)) {
      sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`;
    }
    sql += `\n`;

    // Generate policies
    for (const [tableName, policies] of Object.entries(policiesByTable)) {
      sql += `-- Policies for ${tableName}\n`;
      for (const policy of policies) {
        sql += `CREATE POLICY "${policy.policy_name}" ON ${tableName}\n`;
        sql += `  FOR ${policy.policy_command}\n`;
        if (policy.policy_definition) {
          sql += `  USING (${policy.policy_definition});\n`;
        }
        sql += `\n`;
      }
    }
  }

  // Section 5: Indexes
  sql += `-- ============================================================================
-- SECTION 5: INDEXES
-- ============================================================================\n\n`;

  if (schema.indexes && schema.indexes.length > 0) {
    for (const index of schema.indexes) {
      sql += `-- Index: ${index.index_name} on ${index.table_name}\n`;
      sql += `${index.index_definition};\n\n`;
    }
  }

  // Footer
  sql += `-- ============================================================================
-- END OF BACKUP FILE
-- ============================================================================\n\n`;

  sql += `-- RESTORE INSTRUCTIONS:
-- 1. Create a new Supabase project or PostgreSQL database
-- 2. Run this SQL file completely
-- 3. Configure storage buckets manually via Supabase Dashboard
-- 4. Set up authentication triggers (auth.users trigger)
-- 5. Create first super_admin user and assign role manually
-- 6. Test all RLS policies and permissions
-- 
-- Generated at: ${timestamp}
-- ============================================================================\n`;

  return sql;
}

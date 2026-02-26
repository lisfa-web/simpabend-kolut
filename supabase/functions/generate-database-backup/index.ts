import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[generate-database-backup] Starting backup generation');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ambil schema
    console.log('[generate-database-backup] Fetching database schema...');
    const { data: schemaData, error } = await supabase.rpc('get_database_schema');
    if (error) throw error;

    // Ambil data master
    console.log('[generate-database-backup] Fetching master data...');
    const masterDataTables = [
      'opd', 'master_bank', 'master_pajak', 'jenis_spm', 
      'vendor', 'pihak_ketiga', 'pajak_per_jenis_spm',
      'format_nomor', 'config_sistem', 'permissions',
      'setting_access_control', 'pejabat', 'template_surat',
      'seo_config', 'panduan_manual'
    ];

    const masterData: Record<string, any[]> = {};
    for (const table of masterDataTables) {
      const { data, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(10000);
      if (!tableError && data && data.length > 0) {
        masterData[table] = data;
      }
    }

    console.log('[generate-database-backup] Master data fetched:', Object.keys(masterData).length, 'tables');

    // Generate SQL
    const sqlContent = generateSQLBackup(schemaData, masterData);
    console.log('[generate-database-backup] SQL generated, length:', sqlContent.length);

    return new Response(sqlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="database-backup-${new Date().toISOString().split('T')[0]}.sql"`,
      },
    });

  } catch (error) {
    console.error('[generate-database-backup] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Escape string untuk SQL
function escapeSql(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Mapping tipe data dari information_schema ke SQL yang valid
function mapDataType(col: any): string {
  const dt = col.data_type;
  
  // Enum types yang dikenal
  const knownEnums = [
    'app_role', 'jenis_lampiran', 'jenis_notifikasi', 
    'jenis_pajak', 'status_sp2d', 'status_spm'
  ];
  if (knownEnums.includes(dt)) return `public.${dt}`;
  
  // Mapping standar
  switch (dt) {
    case 'uuid': return 'uuid';
    case 'boolean': return 'boolean';
    case 'integer': return 'integer';
    case 'bigint': return 'bigint';
    case 'smallint': return 'smallint';
    case 'numeric': return 'numeric';
    case 'real': return 'real';
    case 'double precision': return 'double precision';
    case 'text': return 'text';
    case 'jsonb': return 'jsonb';
    case 'json': return 'json';
    case 'inet': return 'inet';
    case 'timestamp with time zone': return 'timestamptz';
    case 'timestamp without time zone': return 'timestamp';
    case 'date': return 'date';
    case 'time with time zone': return 'timetz';
    case 'time without time zone': return 'time';
    case 'character varying':
      return col.character_maximum_length 
        ? `varchar(${col.character_maximum_length})` 
        : 'varchar';
    case 'character':
      return col.character_maximum_length 
        ? `char(${col.character_maximum_length})` 
        : 'char';
    default:
      // Coba cek apakah ini enum yang belum dikenal
      if (!dt.includes(' ') && dt.length < 50) return `public.${dt}`;
      return 'text';
  }
}

function generateSQLBackup(schema: any, masterData: Record<string, any[]>): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================================
-- COMPLETE DATABASE BACKUP (SCHEMA + DATA)
-- Generated: ${timestamp}
-- System: SIMPA BEND BKADKU - Sistem Informasi Manajemen SPM & SP2D
-- 
-- Berisi:
-- 1. ENUM Types
-- 2. Tables dengan PRIMARY KEY, FOREIGN KEY, UNIQUE constraints
-- 3. Database Functions
-- 4. Triggers
-- 5. Row Level Security (RLS) Policies
-- 6. Indexes
-- 7. Master Data (INSERT statements)
-- 8. Storage Buckets
-- ============================================================================

-- Persiapan: Aktifkan ekstensi yang diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`;

  // ========== SECTION 1: ENUM TYPES ==========
  sql += sectionHeader('1', 'ENUM TYPES');
  if (schema.enums?.length > 0) {
    for (const enumType of schema.enums) {
      sql += `DO $$ BEGIN\n`;
      sql += `  CREATE TYPE public.${enumType.name} AS ENUM (\n`;
      sql += enumType.values.map((v: string) => `    '${v}'`).join(',\n');
      sql += `\n  );\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;\n\n`;
    }
  }

  // ========== SECTION 2: TABLES ==========
  sql += sectionHeader('2', 'TABLES');

  // Kelompokkan constraints per tabel
  const constraintsByTable: Record<string, any[]> = {};
  if (schema.constraints?.length > 0) {
    for (const c of schema.constraints) {
      if (!constraintsByTable[c.table_name]) constraintsByTable[c.table_name] = [];
      constraintsByTable[c.table_name].push(c);
    }
  }

  // Urutan tabel untuk menghindari masalah foreign key
  const tableOrder = [
    'master_bank', 'opd', 'jenis_spm', 'master_pajak', 'profiles',
    'config_sistem', 'email_config', 'wa_gateway', 'seo_config',
    'format_nomor', 'permissions', 'setting_access_control',
    'template_surat', 'panduan_manual', 'dashboard_layout',
    'user_roles', 'pejabat', 'vendor', 'pihak_ketiga',
    'spm', 'sp2d', 'lampiran_spm', 'revisi_spm',
    'potongan_pajak_spm', 'potongan_pajak_sp2d',
    'notifikasi', 'pin_otp', 'public_token',
    'audit_log', 'arsip_spm', 'arsip_sp2d',
    'pajak_per_jenis_spm'
  ];

  if (schema.tables?.length > 0) {
    // Urutkan tabel
    const sortedTables = [...schema.tables].sort((a: any, b: any) => {
      const ia = tableOrder.indexOf(a.table_name);
      const ib = tableOrder.indexOf(b.table_name);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    for (const table of sortedTables) {
      const constraints = constraintsByTable[table.table_name] || [];
      const pkConstraint = constraints.find((c: any) => c.constraint_type === 'PRIMARY KEY');
      const uniqueConstraints = constraints.filter((c: any) => c.constraint_type === 'UNIQUE');

      sql += `-- Table: ${table.table_name}\n`;
      sql += `CREATE TABLE IF NOT EXISTS public.${table.table_name} (\n`;

      const colDefs: string[] = [];
      for (const col of table.columns) {
        let def = `  ${col.column_name} ${mapDataType(col)}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        colDefs.push(def);
      }

      // Primary key
      if (pkConstraint && pkConstraint.column_names) {
        colDefs.push(`  CONSTRAINT ${pkConstraint.constraint_name} PRIMARY KEY (${pkConstraint.column_names.join(', ')})`);
      }

      // Unique constraints
      for (const uc of uniqueConstraints) {
        if (uc.column_names) {
          colDefs.push(`  CONSTRAINT ${uc.constraint_name} UNIQUE (${uc.column_names.join(', ')})`);
        }
      }

      sql += colDefs.join(',\n');
      sql += `\n);\n\n`;
    }

    // Foreign keys (terpisah agar tidak masalah urutan)
    sql += `-- Foreign Key Constraints\n`;
    for (const table of sortedTables) {
      const constraints = constraintsByTable[table.table_name] || [];
      const fkConstraints = constraints.filter((c: any) => c.constraint_type === 'FOREIGN KEY');
      
      for (const fk of fkConstraints) {
        if (fk.column_names && fk.foreign_table && fk.foreign_columns) {
          sql += `ALTER TABLE public.${table.table_name} ADD CONSTRAINT ${fk.constraint_name}\n`;
          sql += `  FOREIGN KEY (${fk.column_names.join(', ')}) REFERENCES public.${fk.foreign_table}(${fk.foreign_columns.join(', ')});\n`;
        }
      }
    }
    sql += '\n';
  }

  // ========== SECTION 3: FUNCTIONS ==========
  sql += sectionHeader('3', 'DATABASE FUNCTIONS');
  if (schema.functions?.length > 0) {
    for (const func of schema.functions) {
      sql += `-- Function: ${func.function_name}\n`;
      sql += `${func.function_definition};\n\n`;
    }
  }

  // ========== SECTION 4: TRIGGERS ==========
  sql += sectionHeader('4', 'TRIGGERS');
  if (schema.triggers?.length > 0) {
    for (const trigger of schema.triggers) {
      sql += `-- Trigger: ${trigger.trigger_name} on ${trigger.table_name}\n`;
      sql += `DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON public.${trigger.table_name};\n`;
      sql += `${trigger.trigger_definition};\n\n`;
    }
  }

  // ========== SECTION 5: RLS ==========
  sql += sectionHeader('5', 'ROW LEVEL SECURITY (RLS) POLICIES');
  if (schema.policies?.length > 0) {
    const policiesByTable: Record<string, any[]> = {};
    for (const policy of schema.policies) {
      if (!policiesByTable[policy.table_name]) policiesByTable[policy.table_name] = [];
      policiesByTable[policy.table_name].push(policy);
    }

    // Enable RLS
    sql += `-- Enable RLS\n`;
    for (const tableName of Object.keys(policiesByTable)) {
      sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`;
    }
    sql += '\n';

    // Create policies
    for (const [tableName, policies] of Object.entries(policiesByTable)) {
      sql += `-- Policies untuk ${tableName}\n`;
      for (const policy of policies) {
        const permissive = policy.permissive === 'PERMISSIVE' ? '' : ' AS RESTRICTIVE';
        sql += `CREATE POLICY "${policy.policy_name}" ON ${tableName}${permissive}\n`;
        sql += `  FOR ${policy.policy_cmd || 'ALL'}\n`;
        sql += `  TO public\n`;
        if (policy.policy_qual) sql += `  USING (${policy.policy_qual})\n`;
        if (policy.policy_with_check) sql += `  WITH CHECK (${policy.policy_with_check})\n`;
        sql += `;\n\n`;
      }
    }
  }

  // ========== SECTION 6: INDEXES ==========
  sql += sectionHeader('6', 'INDEXES');
  if (schema.indexes?.length > 0) {
    for (const index of schema.indexes) {
      sql += `-- Index: ${index.index_name}\n`;
      // Gunakan IF NOT EXISTS
      const indexDef = index.index_definition.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS')
        .replace('CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS');
      sql += `${indexDef};\n\n`;
    }
  }

  // ========== SECTION 7: MASTER DATA ==========
  sql += sectionHeader('7', 'MASTER DATA');

  // Urutan insert sesuai dependensi
  const insertOrder = [
    'config_sistem', 'seo_config', 'setting_access_control',
    'master_bank', 'opd', 'jenis_spm', 'master_pajak',
    'format_nomor', 'permissions', 'template_surat',
    'pejabat', 'vendor', 'pihak_ketiga',
    'pajak_per_jenis_spm', 'panduan_manual'
  ];

  for (const tableName of insertOrder) {
    const rows = masterData[tableName];
    if (!rows || rows.length === 0) continue;

    sql += `-- Data: ${tableName} (${rows.length} rows)\n`;
    
    const columns = Object.keys(rows[0]);
    sql += `INSERT INTO public.${tableName} (${columns.join(', ')})\nVALUES\n`;

    const valueSets: string[] = [];
    for (const row of rows) {
      const values = columns.map(col => escapeSql(row[col]));
      valueSets.push(`  (${values.join(', ')})`);
    }
    sql += valueSets.join(',\n');
    sql += `\nON CONFLICT (id) DO NOTHING;\n\n`;
  }

  // ========== SECTION 8: STORAGE BUCKETS ==========
  sql += sectionHeader('8', 'STORAGE BUCKETS');
  sql += `-- Buat storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('ttd-pejabat', 'ttd-pejabat', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('system-logos', 'system-logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('kop-surat', 'kop-surat', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('spm-documents', 'spm-documents', true) ON CONFLICT (id) DO NOTHING;

`;

  // ========== FOOTER ==========
  sql += `-- ============================================================================
-- END OF BACKUP
-- ============================================================================

-- INSTRUKSI RESTORE:
-- 1. Buat project baru atau database PostgreSQL baru
-- 2. Jalankan file SQL ini secara lengkap
-- 3. Buat trigger handle_new_user pada auth.users (via Supabase Dashboard)
-- 4. Buat user super_admin pertama dan assign role secara manual
-- 5. Upload file/asset ke storage buckets yang sudah dibuat
-- 6. Test semua RLS policies dan permissions
-- 7. Deploy edge functions
-- 
-- Generated: ${timestamp}
-- ============================================================================\n`;

  return sql;
}

function sectionHeader(num: string, title: string): string {
  return `-- ============================================================================
-- SECTION ${num}: ${title}
-- ============================================================================\n\n`;
}

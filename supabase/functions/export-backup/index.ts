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
    const { type } = await req.json();
    console.log(`[export-backup] Export type: ${type}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let content = '';
    let filename = '';
    let contentType = 'application/sql';

    switch (type) {
      case 'complete':
        content = await generateCompleteBackup(supabase);
        filename = `complete-backup-${getDateStr()}.sql`;
        break;
      case 'rls':
        content = await generateRLSBackup(supabase);
        filename = `rls-policies-${getDateStr()}.sql`;
        break;
      case 'users':
        content = await generateUsersBackup(supabase);
        filename = `users-auth-${getDateStr()}.sql`;
        break;
      case 'data':
        content = await generateDataBackup(supabase);
        filename = `data-backup-${getDateStr()}.sql`;
        break;
      case 'edge-functions':
        content = await generateEdgeFunctionsDoc();
        filename = `edge-functions-${getDateStr()}.md`;
        contentType = 'text/markdown';
        break;
      default:
        throw new Error('Invalid export type');
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('[export-backup] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDateStr() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================================
// COMPLETE BACKUP
// ============================================================================
async function generateCompleteBackup(supabase: any): Promise<string> {
  const { data: schema, error } = await supabase.rpc('get_database_schema');
  if (error) throw error;

  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================================
-- COMPLETE DATABASE SCHEMA BACKUP
-- Generated: ${timestamp}
-- System: Sistem Informasi Manajemen SPM & SP2D
-- ============================================================================

-- IMPORTANT: Run this script on a fresh PostgreSQL/Supabase database
-- Order of execution: ENUMs -> Tables -> Functions -> Triggers -> RLS -> Indexes

`;

  // ENUMS
  sql += `-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================\n\n`;

  if (schema.enums?.length > 0) {
    for (const e of schema.enums) {
      sql += `DROP TYPE IF EXISTS public.${e.name} CASCADE;\n`;
      sql += `CREATE TYPE public.${e.name} AS ENUM (\n`;
      sql += e.values.map((v: string) => `  '${v}'`).join(',\n');
      sql += `\n);\n\n`;
    }
  }

  // TABLES
  sql += `-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================\n\n`;

  if (schema.tables?.length > 0) {
    for (const t of schema.tables) {
      sql += `-- Table: ${t.table_name}\n`;
      sql += `CREATE TABLE IF NOT EXISTS public.${t.table_name} (\n`;
      const cols = t.columns.map((c: any) => {
        let def = `  ${c.column_name} ${c.data_type}`;
        if (c.is_nullable === 'NO') def += ' NOT NULL';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
        return def;
      });
      sql += cols.join(',\n') + `\n);\n\n`;
    }
  }

  // FUNCTIONS
  sql += `-- ============================================================================
-- SECTION 3: DATABASE FUNCTIONS
-- ============================================================================\n\n`;

  if (schema.functions?.length > 0) {
    for (const f of schema.functions) {
      sql += `-- Function: ${f.function_name}\n`;
      sql += `${f.function_definition}\n\n`;
    }
  }

  // TRIGGERS
  sql += `-- ============================================================================
-- SECTION 4: TRIGGERS
-- ============================================================================\n\n`;

  if (schema.triggers?.length > 0) {
    for (const t of schema.triggers) {
      sql += `-- Trigger: ${t.trigger_name} on ${t.table_name}\n`;
      sql += `${t.trigger_definition};\n\n`;
    }
  }

  // RLS
  sql += await generateRLSSection(schema);

  // INDEXES
  sql += `-- ============================================================================
-- SECTION 6: INDEXES
-- ============================================================================\n\n`;

  if (schema.indexes?.length > 0) {
    for (const i of schema.indexes) {
      sql += `-- Index: ${i.index_name}\n${i.index_definition};\n\n`;
    }
  }

  // STORAGE BUCKETS
  sql += `-- ============================================================================
-- SECTION 7: STORAGE BUCKETS (Manual Setup Required)
-- ============================================================================
-- Create these buckets in Supabase Dashboard → Storage:
-- 
-- 1. ttd-pejabat (public)
-- 2. system-logos (public)
-- 3. kop-surat (public)
-- 4. spm-documents (public)
--
-- Storage policies need to be configured manually via Dashboard.
-- ============================================================================\n\n`;

  // RESTORE INSTRUCTIONS
  sql += `-- ============================================================================
-- RESTORE INSTRUCTIONS
-- ============================================================================
-- 
-- For LOCAL PostgreSQL:
-- 1. Create database: CREATE DATABASE spm_sp2d;
-- 2. Run: psql -d spm_sp2d -f complete-backup.sql
-- 
-- For VPS with Supabase Self-Hosted:
-- 1. Set up Supabase using docker-compose
-- 2. Connect to PostgreSQL and run this SQL
-- 3. Configure storage buckets
-- 4. Set up Edge Functions (see edge-functions export)
-- 
-- For New Supabase Cloud Project:
-- 1. Go to SQL Editor in Dashboard
-- 2. Run this script section by section
-- 3. Configure storage & auth via Dashboard
-- 
-- POST-RESTORE STEPS:
-- 1. Create auth trigger: CREATE TRIGGER on_auth_user_created
--    AFTER INSERT ON auth.users FOR EACH ROW
--    EXECUTE FUNCTION public.handle_new_user();
-- 2. Create first super_admin user manually
-- 3. Test all RLS policies
-- 
-- Generated: ${timestamp}
-- ============================================================================\n`;

  return sql;
}

// ============================================================================
// RLS POLICIES BACKUP
// ============================================================================
async function generateRLSBackup(supabase: any): Promise<string> {
  const { data: schema, error } = await supabase.rpc('get_database_schema');
  if (error) throw error;

  return generateRLSSection(schema);
}

function generateRLSSection(schema: any): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Generated: ${timestamp}
-- ============================================================================\n\n`;

  if (!schema.policies?.length) {
    sql += '-- No RLS policies found\n';
    return sql;
  }

  // Group by table
  const byTable: Record<string, any[]> = {};
  for (const p of schema.policies) {
    const tbl = p.table_name;
    if (!byTable[tbl]) byTable[tbl] = [];
    byTable[tbl].push(p);
  }

  // Enable RLS
  sql += `-- Enable RLS on all tables\n`;
  for (const tbl of Object.keys(byTable)) {
    sql += `ALTER TABLE ${tbl} ENABLE ROW LEVEL SECURITY;\n`;
  }
  sql += `\n`;

  // Generate policies
  for (const [tbl, policies] of Object.entries(byTable)) {
    sql += `-- ============================================\n`;
    sql += `-- Table: ${tbl}\n`;
    sql += `-- ============================================\n\n`;

    for (const p of policies) {
      sql += `-- Drop existing policy if exists\n`;
      sql += `DROP POLICY IF EXISTS "${p.policy_name}" ON ${tbl};\n\n`;
      sql += `CREATE POLICY "${p.policy_name}" ON ${tbl}\n`;
      sql += `  FOR ${p.policy_cmd || 'ALL'}\n`;
      if (p.policy_qual) sql += `  USING (${p.policy_qual})\n`;
      if (p.policy_with_check) sql += `  WITH CHECK (${p.policy_with_check})\n`;
      sql += `;\n\n`;
    }
  }

  return sql;
}

// ============================================================================
// USERS AUTH BACKUP
// ============================================================================
async function generateUsersBackup(supabase: any): Promise<string> {
  const timestamp = new Date().toISOString();
  
  // Fetch profiles
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (pErr) throw pErr;

  // Fetch user roles
  const { data: roles, error: rErr } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: true });
  if (rErr) throw rErr;

  let sql = `-- ============================================================================
-- USER AUTH DATA BACKUP
-- Generated: ${timestamp}
-- ============================================================================
-- 
-- IMPORTANT: This file contains user profile and role data.
-- Auth.users data is NOT included (managed by Supabase Auth).
-- After importing, users will need to re-register or have passwords reset.
-- ============================================================================\n\n`;

  // Profiles
  sql += `-- ============================================================================
-- PROFILES (${profiles?.length || 0} users)
-- ============================================================================\n\n`;

  if (profiles?.length > 0) {
    for (const p of profiles) {
      const vals = [
        `'${p.id}'`,
        `'${escapeSql(p.email)}'`,
        `'${escapeSql(p.full_name)}'`,
        p.phone ? `'${escapeSql(p.phone)}'` : 'NULL',
        p.avatar_url ? `'${escapeSql(p.avatar_url)}'` : 'NULL',
        p.is_active ? 'true' : 'false',
        `'${p.created_at}'`,
        `'${p.updated_at}'`
      ];
      sql += `INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, is_active, created_at, updated_at)\n`;
      sql += `VALUES (${vals.join(', ')})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET\n`;
      sql += `  email = EXCLUDED.email,\n`;
      sql += `  full_name = EXCLUDED.full_name,\n`;
      sql += `  phone = EXCLUDED.phone,\n`;
      sql += `  avatar_url = EXCLUDED.avatar_url,\n`;
      sql += `  is_active = EXCLUDED.is_active;\n\n`;
    }
  }

  // User Roles
  sql += `-- ============================================================================
-- USER ROLES (${roles?.length || 0} role assignments)
-- ============================================================================\n\n`;

  if (roles?.length > 0) {
    for (const r of roles) {
      const vals = [
        `'${r.id}'`,
        `'${r.user_id}'`,
        `'${r.role}'::app_role`,
        r.opd_id ? `'${r.opd_id}'` : 'NULL',
        r.created_by ? `'${r.created_by}'` : 'NULL',
        `'${r.created_at}'`
      ];
      sql += `INSERT INTO public.user_roles (id, user_id, role, opd_id, created_by, created_at)\n`;
      sql += `VALUES (${vals.join(', ')})\n`;
      sql += `ON CONFLICT (id) DO NOTHING;\n\n`;
    }
  }

  sql += `-- ============================================================================
-- RESTORE INSTRUCTIONS FOR AUTH
-- ============================================================================
-- 
-- To restore users with authentication:
-- 
-- Option 1: Re-register Users
-- - Users register again with same email
-- - Profile data will be preserved via handle_new_user trigger
-- - Manually assign roles via admin panel
-- 
-- Option 2: Admin Create Users (for VPS/Self-Hosted)
-- - Use Supabase Admin API to create users
-- - Match user IDs with profile IDs
-- - Run role assignments after user creation
-- 
-- Option 3: Password Reset Flow
-- - Import profiles first
-- - Have users use "Forgot Password" to set new password
-- - System will link existing profile to new auth.user
-- 
-- ============================================================================\n`;

  return sql;
}

// ============================================================================
// DATA BACKUP (Master Data & Config)
// ============================================================================
async function generateDataBackup(supabase: any): Promise<string> {
  const timestamp = new Date().toISOString();
  
  let sql = `-- ============================================================================
-- MASTER DATA & CONFIGURATION BACKUP
-- Generated: ${timestamp}
-- ============================================================================\n\n`;

  // Config sistem
  const { data: config } = await supabase.from('config_sistem').select('*');
  sql += generateInsertStatements('config_sistem', config || [], ['id', 'key', 'value', 'description', 'updated_at']);

  // Format nomor
  const { data: formatNomor } = await supabase.from('format_nomor').select('*');
  sql += generateInsertStatements('format_nomor', formatNomor || [], ['id', 'jenis_dokumen', 'format', 'tahun', 'counter', 'created_at', 'updated_at']);

  // Jenis SPM
  const { data: jenisSpm } = await supabase.from('jenis_spm').select('*');
  sql += generateInsertStatements('jenis_spm', jenisSpm || [], ['id', 'nama_jenis', 'deskripsi', 'ada_pajak', 'is_active', 'created_at', 'updated_at']);

  // Master Bank
  const { data: masterBank } = await supabase.from('master_bank').select('*');
  sql += generateInsertStatements('master_bank', masterBank || [], ['id', 'kode_bank', 'nama_bank', 'is_active', 'created_at', 'updated_at']);

  // Master Pajak
  const { data: masterPajak } = await supabase.from('master_pajak').select('*');
  sql += generateInsertStatements('master_pajak', masterPajak || [], ['id', 'kode_pajak', 'nama_pajak', 'jenis_pajak', 'tarif_default', 'rekening_pajak', 'kategori', 'deskripsi', 'is_active', 'created_at', 'updated_at']);

  // OPD
  const { data: opd } = await supabase.from('opd').select('*');
  sql += generateInsertStatements('opd', opd || [], ['id', 'kode_opd', 'nama_opd', 'alamat', 'telepon', 'email', 'nama_bendahara', 'nomor_rekening_bendahara', 'bank_id', 'is_active', 'created_at', 'updated_at']);

  // Pejabat
  const { data: pejabat } = await supabase.from('pejabat').select('*');
  sql += generateInsertStatements('pejabat', pejabat || [], ['id', 'nama_lengkap', 'nip', 'jabatan', 'opd_id', 'ttd_url', 'is_active', 'created_at', 'updated_at']);

  // Vendor
  const { data: vendor } = await supabase.from('vendor').select('*');
  sql += generateInsertStatements('vendor', vendor || [], ['id', 'nama_vendor', 'npwp', 'alamat', 'telepon', 'email', 'nama_bank', 'nomor_rekening', 'nama_rekening', 'bank_id', 'is_active', 'created_at', 'updated_at']);

  // Pihak Ketiga
  const { data: pihakKetiga } = await supabase.from('pihak_ketiga').select('*');
  sql += generateInsertStatements('pihak_ketiga', pihakKetiga || [], ['id', 'nama_pihak_ketiga', 'npwp', 'alamat', 'telepon', 'email', 'nama_bank', 'nomor_rekening', 'nama_rekening', 'bank_id', 'is_active', 'created_at', 'updated_at']);

  // Pajak per Jenis SPM
  const { data: pajakPerJenis } = await supabase.from('pajak_per_jenis_spm').select('*');
  sql += generateInsertStatements('pajak_per_jenis_spm', pajakPerJenis || [], ['id', 'jenis_spm', 'master_pajak_id', 'is_default', 'urutan', 'uraian_template', 'deskripsi', 'created_at', 'updated_at']);

  // Permissions
  const { data: permissions } = await supabase.from('permissions').select('*');
  sql += generateInsertStatements('permissions', permissions || [], ['id', 'role', 'resource', 'can_create', 'can_read', 'can_update', 'can_delete', 'created_at']);

  // Template Surat
  const { data: templateSurat } = await supabase.from('template_surat').select('*');
  sql += generateInsertStatements('template_surat', templateSurat || [], ['id', 'nama_template', 'jenis_surat', 'konten_html', 'kop_surat_url', 'variables', 'is_active', 'created_at', 'updated_at']);

  // Panduan Manual
  const { data: panduan } = await supabase.from('panduan_manual').select('*');
  sql += generateInsertStatements('panduan_manual', panduan || [], ['id', 'judul', 'konten', 'role', 'urutan', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at']);

  return sql;
}

function generateInsertStatements(tableName: string, data: any[], columns: string[]): string {
  if (!data?.length) return `-- ${tableName}: No data\n\n`;

  let sql = `-- ============================================\n`;
  sql += `-- ${tableName.toUpperCase()} (${data.length} records)\n`;
  sql += `-- ============================================\n\n`;

  for (const row of data) {
    const values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return val.toString();
      if (typeof val === 'object') return `'${escapeSql(JSON.stringify(val))}'`;
      return `'${escapeSql(String(val))}'`;
    });
    sql += `INSERT INTO public.${tableName} (${columns.join(', ')})\n`;
    sql += `VALUES (${values.join(', ')})\n`;
    sql += `ON CONFLICT (id) DO NOTHING;\n\n`;
  }

  return sql;
}

function escapeSql(str: string): string {
  return str?.replace(/'/g, "''") || '';
}

// ============================================================================
// EDGE FUNCTIONS DOCUMENTATION
// ============================================================================
async function generateEdgeFunctionsDoc(): Promise<string> {
  const timestamp = new Date().toISOString();
  
  const functions = [
    {
      name: 'auto-archive',
      description: 'Otomatis mengarsipkan SPM dan SP2D yang sudah lama',
      jwt: false,
      endpoints: ['POST /auto-archive'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'check-email-for-reset',
      description: 'Cek apakah email terdaftar untuk reset password',
      jwt: false,
      endpoints: ['POST /check-email-for-reset'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'create-demo-user',
      description: 'Membuat demo user untuk testing',
      jwt: false,
      endpoints: ['POST /create-demo-user'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'create-user',
      description: 'Admin membuat user baru dengan role',
      jwt: false,
      endpoints: ['POST /create-user'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'delete-user',
      description: 'Admin menghapus user',
      jwt: false,
      endpoints: ['POST /delete-user'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'export-backup',
      description: 'Export database backup dalam berbagai format',
      jwt: false,
      endpoints: ['POST /export-backup'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'generate-database-backup',
      description: 'Generate complete SQL backup',
      jwt: false,
      endpoints: ['POST /generate-database-backup'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'reset-user-password',
      description: 'Reset password user (admin atau forgot password)',
      jwt: false,
      endpoints: ['POST /reset-user-password'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'seed-test-users',
      description: 'Seed test users untuk development',
      jwt: false,
      endpoints: ['POST /seed-test-users'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-approval-notification',
      description: 'Kirim notifikasi approval via WhatsApp',
      jwt: false,
      endpoints: ['POST /send-approval-notification'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-disbursement-notification',
      description: 'Kirim notifikasi pencairan SP2D',
      jwt: false,
      endpoints: ['POST /send-disbursement-notification'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-password-reset-notification',
      description: 'Kirim notifikasi reset password via WA',
      jwt: false,
      endpoints: ['POST /send-password-reset-notification'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-pin',
      description: 'Generate dan kirim PIN untuk verifikasi SPM',
      jwt: false,
      endpoints: ['POST /send-pin'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-sp2d-otp',
      description: 'Generate dan kirim OTP untuk verifikasi SP2D',
      jwt: false,
      endpoints: ['POST /send-sp2d-otp'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'send-workflow-notification',
      description: 'Kirim notifikasi workflow SPM',
      jwt: false,
      endpoints: ['POST /send-workflow-notification'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'test-email',
      description: 'Test konfigurasi email SMTP',
      jwt: false,
      endpoints: ['POST /test-email'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'test-wa-gateway',
      description: 'Test koneksi WA Gateway (Fonnte)',
      jwt: false,
      endpoints: ['POST /test-wa-gateway'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'toggle-emergency-mode',
      description: 'Toggle emergency mode sistem',
      jwt: false,
      endpoints: ['POST /toggle-emergency-mode'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'update-user-email',
      description: 'Admin mengubah email user',
      jwt: false,
      endpoints: ['POST /update-user-email'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
      name: 'verify-reset-otp',
      description: 'Verifikasi OTP untuk reset password',
      jwt: false,
      endpoints: ['POST /verify-reset-otp'],
      env: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    }
  ];

  let doc = `# Edge Functions Documentation
Generated: ${timestamp}

## Overview

Sistem SPM/SP2D menggunakan ${functions.length} Edge Functions untuk berbagai fitur backend.

## Deployment ke VPS/Server Lokal

### Prerequisites
- Deno runtime (v1.40+)
- Supabase CLI atau setup manual
- Environment variables configured

### Environment Variables Required
\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### supabase/config.toml
\`\`\`toml
project_id = "your-project-id"

`;

  for (const fn of functions) {
    doc += `[functions.${fn.name}]\n`;
    doc += `verify_jwt = ${fn.jwt}\n\n`;
  }

  doc += `\`\`\`

## Functions List

`;

  for (const fn of functions) {
    doc += `### ${fn.name}

**Description:** ${fn.description}

**JWT Required:** ${fn.jwt ? 'Yes' : 'No'}

**Endpoints:**
${fn.endpoints.map(e => `- \`${e}\``).join('\n')}

**Environment Variables:**
${fn.env.map(e => `- \`${e}\``).join('\n')}

---

`;
  }

  doc += `## Manual Deployment Steps

1. **Clone Edge Functions Directory**
   \`\`\`bash
   # Copy supabase/functions folder to your server
   scp -r supabase/functions user@server:/path/to/project/
   \`\`\`

2. **Install Deno (if not installed)**
   \`\`\`bash
   curl -fsSL https://deno.land/install.sh | sh
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   export SUPABASE_URL="your-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-key"
   \`\`\`

4. **Run with Supabase CLI**
   \`\`\`bash
   supabase functions serve --env-file .env
   \`\`\`

5. **Or Deploy to Supabase Cloud**
   \`\`\`bash
   supabase functions deploy
   \`\`\`

## Integration Notes

- All functions use Fonnte API for WhatsApp notifications
- Configure \`wa_gateway\` table with valid API key
- Configure \`email_config\` table for SMTP settings
- Service role key is required for admin operations
`;

  return doc;
}

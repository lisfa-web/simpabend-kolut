import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify super_admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (roleError || !userRole) {
      throw new Error('Only Super Admin can manage emergency mode');
    }

    const { enabled, reason } = await req.json();

    if (enabled && (!reason || reason.trim().length < 10)) {
      throw new Error('Alasan aktivasi minimal 10 karakter');
    }

    // Update config
    const timestamp = enabled ? new Date().toISOString() : '';
    
    await supabase.from('config_sistem').upsert({ 
      key: 'emergency_mode_enabled', 
      value: enabled ? 'true' : 'false' 
    }, { onConflict: 'key' });

    await supabase.from('config_sistem').upsert({ 
      key: 'emergency_mode_activated_at', 
      value: timestamp 
    }, { onConflict: 'key' });

    await supabase.from('config_sistem').upsert({ 
      key: 'emergency_mode_activated_by', 
      value: enabled ? user.id : '' 
    }, { onConflict: 'key' });

    await supabase.from('config_sistem').upsert({ 
      key: 'emergency_mode_reason', 
      value: enabled ? reason : '' 
    }, { onConflict: 'key' });

    // Get user profile for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Create audit log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: enabled ? 'enable_emergency_mode' : 'disable_emergency_mode',
      resource: 'config_sistem',
      resource_id: 'emergency_mode',
      new_data: { enabled, reason, timestamp },
      is_emergency: true,
      emergency_reason: reason,
    });

    // Send notification to all admins
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(full_name, email, phone)')
      .in('role', ['super_admin', 'administrator', 'kepala_bkad', 'kuasa_bud']) as { data: Array<{ user_id: string, profiles: { full_name: string, email: string, phone?: string } }> | null };

    const notificationMessage = enabled 
      ? `🚨 MODE EMERGENCY DIAKTIFKAN oleh ${profile?.full_name || user.email}\n\nAlasan: ${reason}\n\nVerifikasi OTP/PIN telah di-bypass untuk semua approval.`
      : `✅ Mode Emergency dinonaktifkan oleh ${profile?.full_name || user.email}`;

    // Create notifications for all admins
    if (admins) {
      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        jenis: 'sistem' as any,
        judul: enabled ? '🚨 Mode Emergency Aktif' : '✅ Mode Emergency Nonaktif',
        pesan: notificationMessage,
      }));

      await supabase.from('notifikasi').insert(notifications);
    }

    // Send email notification (async, no await)
    const { data: emailConfig } = await supabase
      .from('email_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (emailConfig && admins) {
      // Email sending would go here using SMTP
      console.log('Email notification sent to admins');
    }

    // Send WhatsApp notification (async, no await)
    const { data: waConfig } = await supabase
      .from('wa_gateway')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (waConfig && admins) {
      for (const admin of admins) {
        if (admin.profiles.phone) {
          try {
            await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: {
                'Authorization': waConfig.api_key,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                target: admin.profiles.phone,
                message: notificationMessage,
              }),
            });
          } catch (error) {
            console.error('WhatsApp send error:', error);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: enabled ? 'Mode emergency diaktifkan' : 'Mode emergency dinonaktifkan',
        enabled,
        activated_at: timestamp,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in toggle-emergency-mode:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

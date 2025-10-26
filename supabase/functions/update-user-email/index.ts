import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) throw rolesError;

    const isAdmin = userRoles?.some(r => r.role === 'administrator' || r.role === 'super_admin');
    if (!isAdmin) {
      throw new Error('Hanya administrator yang dapat mengubah email user');
    }

    // Get request body
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      throw new Error('userId dan newEmail harus diisi');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Format email tidak valid');
    }

    // Check if new email already exists
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(u => 
      u.email?.toLowerCase() === newEmail.toLowerCase() && u.id !== userId
    );

    if (emailExists) {
      throw new Error('Email sudah digunakan oleh user lain');
    }

    // Update email in auth.users using admin API
    const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { email: newEmail }
    );

    if (updateError) throw updateError;

    // Update email in profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Log to audit_log
    await supabaseClient
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'update',
        resource: 'user_email',
        resource_id: userId,
        old_data: { email: updatedUser.user?.email },
        new_data: { email: newEmail },
      });

    console.log(`Email updated successfully for user ${userId}: ${newEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email berhasil diubah. User harus login dengan email baru.',
        user: updatedUser.user 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in update-user-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

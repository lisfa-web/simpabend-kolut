import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing backend configuration");
    }

    // Create admin client with service role
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify the calling user is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the calling user to verify they're an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await admin.auth.getUser(token);
    
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if calling user has admin role and can write (exclude demo_admin)
    const { data: userRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id);

    const isDemoAdmin = userRoles?.some(r => r.role === "demo_admin");
    if (isDemoAdmin) {
      return new Response(
        JSON.stringify({ error: "Demo admin tidak dapat membuat user baru" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = userRoles?.some(r => r.role === "administrator" || r.role === "kepala_bkad");
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email, password, full_name, phone, roles } = await req.json();

    if (!email || !password || !full_name || !roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await admin.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      return new Response(
        JSON.stringify({ error: "Email sudah terdaftar di sistem" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user with service role
    const { data: authData, error: authCreateError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (authCreateError) {
      // Handle duplicate email error
      if (authCreateError.message?.includes("already been registered") || authCreateError.message?.includes("email_exists")) {
        return new Response(
          JSON.stringify({ error: "Email sudah terdaftar di sistem" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw authCreateError;
    }

    if (!authData.user) {
      throw new Error("User creation failed");
    }

    const userId = authData.user.id;

    // Update profile
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name,
        phone: phone || null,
      })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    // Insert roles - Filter out super_admin and demo_admin as they're not in DB enum
    // These are TypeScript-only roles for client-side logic
    const validRoles = roles.filter((r: any) => 
      r.role !== 'super_admin' && r.role !== 'demo_admin'
    );

    if (validRoles.length === 0) {
      // If user only had super_admin/demo_admin roles, default to administrator
      validRoles.push({ role: 'administrator' });
    }

    const rolesData = validRoles.map((r: any) => ({
      user_id: userId,
      role: r.role,
      opd_id: r.opd_id || null,
    }));

    const { error: rolesError } = await admin
      .from("user_roles")
      .insert(rolesData);

    if (rolesError) {
      throw rolesError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email: authData.user.email,
          full_name,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create user" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

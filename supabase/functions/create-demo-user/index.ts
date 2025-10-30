import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if demo user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", "demo@admin.local")
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Demo user already exists",
          email: "demo@admin.local"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create demo user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "demo@admin.local",
      password: "Demo123!",
      email_confirm: true,
      user_metadata: {
        full_name: "Demo Administrator",
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user data returned");
    }

    console.log("Auth user created:", authData.user.id);

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: "Demo Administrator",
        is_active: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Profile updated");

    // Assign demo_admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "demo_admin",
        created_by: authData.user.id,
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      throw roleError;
    }

    console.log("Role assigned");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo user created successfully",
        email: "demo@admin.local",
        password: "Demo123!",
        user_id: authData.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-demo-user function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

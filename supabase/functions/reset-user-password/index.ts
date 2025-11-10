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
        JSON.stringify({ error: "Demo admin tidak dapat mereset password" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isSuperAdmin = userRoles?.some(r => r.role === "super_admin");
    const isRegularAdmin = userRoles?.some(r => r.role === "administrator" || r.role === "kepala_bkad");
    
    if (!isSuperAdmin && !isRegularAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Missing userId or newPassword" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target user's roles to check if they're a super_admin
    const { data: targetUserRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const targetIsSuperAdmin = targetUserRoles?.some(r => r.role === "super_admin");
    
    // Regular admin cannot reset super_admin passwords
    if (!isSuperAdmin && targetIsSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "Administrator tidak dapat mereset password Super Admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset password using admin API
    const { error: resetError } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (resetError) {
      throw resetError;
    }

    // Try to send WhatsApp notification (don't fail if this errors)
    try {
      await admin.functions.invoke("send-password-reset-notification", {
        body: { userId },
      });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the whole operation if notification fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Password reset successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error resetting password:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to reset password" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

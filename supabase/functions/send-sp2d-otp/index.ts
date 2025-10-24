import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sp2dId, userId } = await req.json();

    if (!sp2dId || !userId) {
      throw new Error('sp2dId dan userId diperlukan');
    }

    console.log('Generating OTP for SP2D:', sp2dId);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    // Set expiry to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Insert OTP to database
    const { error: otpError } = await supabase
      .from('pin_otp')
      .insert({
        user_id: userId,
        sp2d_id: sp2dId,
        jenis: 'sp2d_verification',
        kode_hash: otp,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (otpError) {
      console.error('Error inserting OTP:', otpError);
      throw new Error('Gagal menyimpan OTP');
    }

    // Fetch user profile for phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Data pengguna tidak ditemukan');
    }

    if (!profile.phone) {
      throw new Error('Nomor WhatsApp belum terdaftar di profil Anda');
    }

    // Fetch SP2D details
    const { data: sp2d, error: sp2dError } = await supabase
      .from('sp2d')
      .select('nomor_sp2d, nilai_sp2d')
      .eq('id', sp2dId)
      .single();

    if (sp2dError || !sp2d) {
      console.error('Error fetching SP2D:', sp2dError);
      throw new Error('Data SP2D tidak ditemukan');
    }

    // Fetch WA Gateway config
    const { data: waConfig, error: waError } = await supabase
      .from('wa_gateway')
      .select('*')
      .eq('is_active', true)
      .single();

    if (waError || !waConfig) {
      console.error('Error fetching WA Gateway config:', waError);
      throw new Error('WhatsApp Gateway tidak aktif');
    }

    // Format nilai
    const nilaiFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(Number(sp2d.nilai_sp2d));

    // Prepare WhatsApp message
    const message = `🔐 *VERIFIKASI SP2D*

Yth. ${profile.full_name},

Berikut adalah kode OTP untuk verifikasi SP2D:

*${otp}*

📄 Nomor SP2D: ${sp2d.nomor_sp2d}
💰 Nilai: ${nilaiFormatted}

⚠️ *Penting:*
• OTP berlaku selama 15 menit
• Jangan bagikan OTP kepada siapapun
• OTP hanya dapat digunakan sekali

Gunakan OTP ini untuk memverifikasi SP2D di sistem.`;

    // Send via Fonnte
    const fonnte = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': waConfig.api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: profile.phone,
        message: message,
        countryCode: '62',
      }),
    });

    const fonntResult = await fonnte.json();
    console.log('Fonnte response:', fonntResult);

    if (!fonnte.ok) {
      throw new Error('Gagal mengirim OTP via WhatsApp');
    }

    // Log notification
    await supabase.from('notifikasi').insert({
      user_id: userId,
      judul: 'Kode OTP SP2D',
      pesan: `Kode OTP untuk verifikasi SP2D ${sp2d.nomor_sp2d} telah dikirim ke WhatsApp Anda`,
      jenis: 'sp2d',
      spm_id: null,
      sent_via_wa: true,
      wa_sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP berhasil dikirim ke WhatsApp Anda',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-sp2d-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim OTP';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

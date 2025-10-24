import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisbursementNotificationRequest {
  sp2dId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sp2dId }: DisbursementNotificationRequest = await req.json();

    if (!sp2dId) {
      throw new Error('sp2dId is required');
    }

    console.log('Processing disbursement notification for SP2D:', sp2dId);

    // Fetch SP2D with related data
    const { data: sp2d, error: sp2dError } = await supabase
      .from('sp2d')
      .select(`
        *,
        spm:spm_id (
          *,
          vendor:vendor_id (
            nama_vendor,
            telepon
          )
        )
      `)
      .eq('id', sp2dId)
      .single();

    if (sp2dError || !sp2d) {
      throw new Error(`Failed to fetch SP2D: ${sp2dError?.message}`);
    }

    const vendor = sp2d.spm?.vendor;
    
    if (!vendor) {
      console.warn('No vendor found for SP2D:', sp2dId);
      return new Response(
        JSON.stringify({ success: false, error: 'Vendor not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!vendor.telepon) {
      console.warn('Vendor does not have phone number:', vendor.nama_vendor);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Vendor phone number not set',
          vendor: vendor.nama_vendor 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch WA Gateway configuration
    const { data: waGateway, error: waError } = await supabase
      .from('wa_gateway')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (waError || !waGateway) {
      console.warn('WhatsApp Gateway not configured or inactive');
      return new Response(
        JSON.stringify({ success: false, error: 'WhatsApp Gateway not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Format date
    const tanggalCair = sp2d.tanggal_cair 
      ? new Date(sp2d.tanggal_cair).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : '-';

    // Format currency
    const nilaiFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(sp2d.nilai_sp2d);

    // Prepare WhatsApp message
    const message = `🎉 *NOTIFIKASI PENCAIRAN DANA*

Kepada Yth. ${vendor.nama_vendor}

Dana untuk SP2D telah dicairkan:

📄 Nomor SP2D: ${sp2d.nomor_sp2d}
💰 Nilai: ${nilaiFormatted}
🏦 Bank: ${sp2d.nama_bank}
💳 Rekening: ${sp2d.nomor_rekening}
👤 Nama Rekening: ${sp2d.nama_rekening}
📅 Tanggal Cair: ${tanggalCair}

Silakan cek rekening Anda.

Terima kasih.
_Sistem Informasi BKAD_`;

    console.log('Sending WhatsApp notification to:', vendor.telepon);

    // Send WhatsApp via Fonnte
    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': waGateway.api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: vendor.telepon,
        message: message,
        countryCode: '62',
      }),
    });

    const fonnteResult = await fonnteResponse.json();
    console.log('Fonnte API response:', fonnteResult);

    if (!fonnteResponse.ok) {
      throw new Error(`Failed to send WhatsApp: ${JSON.stringify(fonnteResult)}`);
    }

    // Log notification (optional - for tracking purposes)
    await supabase.from('notifikasi').insert({
      user_id: sp2d.created_by, // Use SP2D creator as reference
      jenis: 'pencairan_dana',
      judul: 'Dana SP2D Telah Dicairkan',
      pesan: `Dana untuk SP2D ${sp2d.nomor_sp2d} telah dicairkan ke vendor ${vendor.nama_vendor}`,
      sent_via_wa: true,
      wa_sent_at: new Date().toISOString(),
    });

    console.log('Disbursement notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent to vendor',
        vendor: vendor.nama_vendor,
        phone: vendor.telepon
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending disbursement notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

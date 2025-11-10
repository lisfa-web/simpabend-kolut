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

    // Fetch SP2D with related SPM data including bendahara
    const { data: sp2d, error: sp2dError } = await supabase
      .from('sp2d')
      .select(`
        *,
        spm:spm_id (
          *,
          opd:opd_id (
            nama_opd
          ),
          bendahara:bendahara_id (
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('id', sp2dId)
      .single();

    if (sp2dError || !sp2d) {
      throw new Error(`Failed to fetch SP2D: ${sp2dError?.message}`);
    }

    const spm = sp2d.spm;
    
    if (!spm) {
      console.warn('No SPM found for SP2D:', sp2dId);
      return new Response(
        JSON.stringify({ success: false, error: 'SPM not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get bendahara phone number
    const bendahara = spm.bendahara;
    const bendaharaPhone = bendahara?.phone;
    
    if (!bendaharaPhone) {
      console.warn('No phone number available for bendahara:', bendahara?.full_name);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Bendahara phone number not available',
          bendahara: bendahara?.full_name || '-'
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

    // Prepare WhatsApp message for bendahara
    const message = `🎉 *NOTIFIKASI PENCAIRAN DANA SP2D*

Kepada Yth. ${bendahara?.full_name}
Bendahara Pengeluaran ${spm.opd?.nama_opd || '-'}

Dana SP2D telah berhasil dicairkan:

📄 Nomor SPM: ${spm.nomor_spm || '-'}
📄 Nomor SP2D: ${sp2d.nomor_sp2d}
💰 Nilai SP2D: ${nilaiFormatted}
💰 Nilai Diterima: ${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(sp2d.nilai_diterima || sp2d.nilai_sp2d)}
👤 Penerima: ${spm.nama_penerima}
🏦 Bank: ${spm.nama_bank || sp2d.nama_bank || '-'}
💳 Rekening: ${spm.nomor_rekening || sp2d.nomor_rekening || '-'}
👤 A/n: ${spm.nama_rekening || sp2d.nama_rekening || '-'}
📅 Tanggal Cair: ${tanggalCair}

Dana telah ditransfer ke rekening penerima. Silakan informasikan kepada penerima untuk mengecek rekening mereka.

Terima kasih.
_Sistem Informasi BKAD_`;

    console.log('Sending WhatsApp notification to bendahara:', bendahara?.full_name, '-', bendaharaPhone);

    // Send WhatsApp via Fonnte
    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': waGateway.api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: bendaharaPhone,
        message: message,
        countryCode: '62',
      }),
    });

    const fonnteResult = await fonnteResponse.json();
    console.log('Fonnte API response:', fonnteResult);

    if (!fonnteResponse.ok) {
      throw new Error(`Failed to send WhatsApp: ${JSON.stringify(fonnteResult)}`);
    }

    // Log notification to bendahara
    await supabase.from('notifikasi').insert({
      user_id: spm.bendahara_id,
      jenis: 'pencairan_dana',
      judul: 'Dana SP2D Telah Dicairkan',
      pesan: `Dana untuk SP2D ${sp2d.nomor_sp2d} senilai ${nilaiFormatted} telah dicairkan ke rekening ${spm.nama_penerima}`,
      sent_via_wa: true,
      wa_sent_at: new Date().toISOString(),
    });

    console.log('Disbursement notification sent successfully to bendahara');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent to bendahara',
        bendahara: bendahara?.full_name,
        phone: bendaharaPhone
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

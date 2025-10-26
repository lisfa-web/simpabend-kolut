import { formatCurrency } from "./currency";
import { terbilangRupiah, formatTanggalIndonesia, formatAngka } from "./formatHelpers";

interface SpmPrintData {
  nomor_spm: string;
  tanggal_spm?: string;
  tanggal_ajuan: string;
  nilai_spm: number;
  total_potongan?: number;
  nilai_bersih?: number;
  uraian?: string;
  jenis_spm: string;
  nomor_berkas?: string;
  nomor_antrian?: string;
  opd?: {
    nama_opd: string;
    kode_opd?: string;
  };
  program?: {
    nama_program: string;
    kode_program?: string;
  };
  kegiatan?: {
    nama_kegiatan: string;
    kode_kegiatan?: string;
  };
  subkegiatan?: {
    nama_subkegiatan: string;
    kode_subkegiatan?: string;
  };
  vendor?: {
    nama_vendor?: string;
    npwp?: string;
    nama_bank?: string;
    nomor_rekening?: string;
    nama_rekening?: string;
  };
  bendahara?: {
    full_name: string;
    email?: string;
  };
  potongan_pajak?: Array<{
    jenis_pajak: string;
    rekening_pajak?: string;
    uraian?: string;
    tarif: number;
    dasar_pengenaan: number;
    jumlah_pajak: number;
  }>;
}

export const generateSpmPDF = (
  spmData: SpmPrintData,
  logoUrl?: string | null,
  kepalaBkadName: string = "Kuasa Bendahara Umum Daerah",
  kepalaBkadNip: string = "",
  namaKota: string = "Samarinda",
  namaInstansi: string = "PEMERINTAH KABUPATEN KOLAKA UTARA"
) => {
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    alert("Pop-up diblokir. Izinkan pop-up untuk mencetak PDF.");
    return;
  }

  const tahunAnggaran = new Date(spmData.tanggal_spm || spmData.tanggal_ajuan).getFullYear();
  const tanggalSpm = formatTanggalIndonesia(spmData.tanggal_spm || spmData.tanggal_ajuan);
  const nilaiBersih = spmData.nilai_bersih || (spmData.nilai_spm - (spmData.total_potongan || 0));
  const nilaiBersihTerbilang = terbilangRupiah(nilaiBersih);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Surat Perintah Membayar (SPM) - ${spmData.nomor_spm}</title>
        <style>
          @page {
            size: legal;
            margin: 2cm 2.5cm;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
          }
          
          .kop-container {
            border: 2px solid black;
            display: table;
            width: 100%;
            margin-bottom: 15px;
          }
          
          .kop-logo {
            display: table-cell;
            width: 100px;
            vertical-align: middle;
            padding: 10px;
            text-align: center;
          }
          
          .kop-logo img {
            max-height: 80px;
            max-width: 90px;
          }
          
          .kop-text {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 10px;
          }
          
          .kop-text h2 {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
          }
          
          .kop-text h3 {
            margin: 5px 0 0 0;
            font-size: 13pt;
            font-weight: bold;
          }
          
          .info-header-bordered {
            border: 1px solid black;
            margin-bottom: 15px;
          }
          
          .info-layout {
            display: table;
            width: 100%;
          }
          
          .info-left,
          .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 8px 12px;
            border-right: 1px solid black;
          }
          
          .info-right {
            border-right: none;
          }
          
          .info-row {
            margin-bottom: 4px;
          }
          
          .info-label {
            display: inline-block;
            width: 130px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          
          table.bordered {
            border: 2px solid black;
          }
          
          table.bordered td,
          table.bordered th {
            border: 1px solid black;
            padding: 6px 8px;
            vertical-align: top;
          }
          
          table.bordered th {
            font-weight: bold;
            text-align: center;
            background-color: #f5f5f5;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .section-title {
            font-weight: bold;
            margin: 12px 0 6px 0;
          }
          
          .bank-instruction {
            border: 1px solid black;
            padding: 10px;
            margin-bottom: 12px;
            line-height: 1.6;
          }
          
          .data-penerima {
            margin: 12px 0;
          }
          
          .data-penerima .row {
            margin-bottom: 4px;
          }
          
          .data-penerima .label {
            display: inline-block;
            width: 160px;
          }
          
          .footer-notes {
            margin-top: 20px;
            font-size: 10pt;
            line-height: 1.5;
          }
          
          .signature-section {
            margin-top: 40px;
            text-align: right;
          }
          
          .signature-space {
            height: 70px;
          }
          
          .signature-line {
            border-bottom: 2px solid black;
            width: 220px;
            margin: 0 0 2px auto;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            button {
              display: none !important;
            }
            
            @page {
              margin: 2cm 2.5cm;
            }
          }
        </style>
      </head>
      <body>
        <!-- Kop Surat dengan Border -->
        <div class="kop-container">
          ${logoUrl ? `
            <div class="kop-logo">
              <img src="${logoUrl}" alt="Logo" />
            </div>
          ` : '<div class="kop-logo"></div>'}
          <div class="kop-text">
            <h2>${namaInstansi}</h2>
            <h3>SURAT PERINTAH MEMBAYAR (SPM)</h3>
          </div>
        </div>
        
        <!-- Info Header 2 Kolom dengan Border -->
        <div class="info-header-bordered">
          <div class="info-layout">
            <div class="info-left">
              <div class="info-row">
                <span class="info-label">No. SPM</span>
                <span>: <strong>${spmData.nomor_spm}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Tanggal</span>
                <span>: ${tanggalSpm}</span>
              </div>
              <div class="info-row">
                <span class="info-label">SKPD</span>
                <span>: ${spmData.opd?.nama_opd || '-'}</span>
              </div>
            </div>
            <div class="info-right">
              <div class="info-row">
                <span class="info-label">Dari</span>
                <span>: ${kepalaBkadName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Nomor</span>
                <span>: ${spmData.nomor_spm}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tanggal</span>
                <span>: ${tanggalSpm}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tahun Anggaran</span>
                <span>: ${tahunAnggaran}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bank / Pos dengan Border -->
        <div class="bank-instruction">
          <strong>Bank / Pos:</strong> ${spmData.vendor?.nama_bank || '[Nama Bank]'}<br>
          Hendaklah mencairkan/memindahbukukan dari baki Rekening Nomor <strong>${spmData.vendor?.nomor_rekening || '[No Rekening]'}</strong> 
          Uang sebesar <strong>Rp ${formatAngka(nilaiBersih)}</strong> 
          (Terbilang: <strong>${nilaiBersihTerbilang}</strong>)
        </div>
        
        <!-- Data Penerima -->
        <div class="data-penerima">
          <div class="row">
            <span class="label"><strong>Kepada</strong></span>
            <span>: ${spmData.vendor?.nama_vendor || '-'}</span>
          </div>
          <div class="row">
            <span class="label"><strong>NPWP</strong></span>
            <span>: ${spmData.vendor?.npwp || '-'}</span>
          </div>
          <div class="row">
            <span class="label"><strong>No. Rekening Bank</strong></span>
            <span>: ${spmData.vendor?.nomor_rekening || '-'}</span>
          </div>
          <div class="row">
            <span class="label"><strong>Bank / Pos</strong></span>
            <span>: ${spmData.vendor?.nama_bank || '-'}</span>
          </div>
          <div class="row">
            <span class="label"><strong>Keperluan Untuk</strong></span>
            <span>: ${spmData.uraian || '-'}</span>
          </div>
        </div>
        
        <!-- Tabel Rincian dengan Border Tebal -->
        <table class="bordered">
          <thead>
            <tr>
              <th style="width: 5%;">NO.</th>
              <th style="width: 18%;">REKENING</th>
              <th style="width: 57%;">URAIAN</th>
              <th style="width: 20%;">JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">1</td>
              <td>${spmData.program?.kode_program || '-'}.${spmData.kegiatan?.kode_kegiatan || '-'}.${spmData.subkegiatan?.kode_subkegiatan || '-'}</td>
              <td>
                <strong>Program:</strong> ${spmData.program?.nama_program || '-'}<br>
                <strong>Kegiatan:</strong> ${spmData.kegiatan?.nama_kegiatan || '-'}<br>
                <strong>Sub Kegiatan:</strong> ${spmData.subkegiatan?.nama_subkegiatan || '-'}
              </td>
              <td class="text-right">Rp ${formatAngka(spmData.nilai_spm)}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td colspan="3" class="text-right"><strong>JUMLAH</strong></td>
              <td class="text-right"><strong>Rp ${formatAngka(spmData.nilai_spm)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Potongan-Potongan -->
        ${spmData.potongan_pajak && spmData.potongan_pajak.length > 0 ? `
        <div class="section-title">Potongan-Potongan:</div>
        <table class="bordered">
          <thead>
            <tr>
              <th style="width: 5%;">NO.</th>
              <th style="width: 18%;">REKENING</th>
              <th style="width: 57%;">URAIAN</th>
              <th style="width: 20%;">JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            ${spmData.potongan_pajak.map((pajak, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${pajak.rekening_pajak || '-'}</td>
                <td>${pajak.jenis_pajak} - ${pajak.uraian || ''} (${pajak.tarif}%)</td>
                <td class="text-right">Rp ${formatAngka(pajak.jumlah_pajak)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #f5f5f5;">
              <td colspan="3" class="text-right"><strong>JUMLAH POTONGAN</strong></td>
              <td class="text-right"><strong>Rp ${formatAngka(spmData.total_potongan || 0)}</strong></td>
            </tr>
          </tbody>
        </table>
        ` : ''}
        
        <!-- Informasi (tidak mengurangi jumlah pembayaran SP2D) -->
        <div class="section-title">Informasi (tidak mengurangi jumlah pembayaran SP2D):</div>
        <table class="bordered">
          <tbody>
            <tr>
              <td style="width: 100%; height: 30px;"></td>
            </tr>
          </tbody>
        </table>
        
        <!-- SP2D yang Dibayarkan (Summary Box) -->
        <div class="section-title">SP2D yang Dibayarkan:</div>
        <table class="bordered">
          <tbody>
            <tr>
              <td style="width: 70%;"><strong>Jumlah yang diminta</strong></td>
              <td class="text-right" style="width: 30%;">Rp ${formatAngka(spmData.nilai_spm)}</td>
            </tr>
            <tr>
              <td><strong>Jumlah Potongan</strong></td>
              <td class="text-right">Rp ${formatAngka(spmData.total_potongan || 0)}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td><strong>Jumlah yang Dibayarkan</strong></td>
              <td class="text-right"><strong>Rp ${formatAngka(nilaiBersih)}</strong></td>
            </tr>
            <tr>
              <td colspan="2"><strong>Uang Sejumlah:</strong> ${nilaiBersihTerbilang}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer Lembar -->
        <div class="footer-notes">
          <div>Lembar 1 : Bank Yang Ditunjuk</div>
          <div>Lembar 2 : Pengguna Anggaran / Kuasa Pengguna Anggaran</div>
          <div>Lembar 3 : Arsip Kuasa BUD</div>
          <div>Lembar 4 : Pihak Ketiga (*)</div>
        </div>
        
        <!-- Tanda Tangan (Kanan Bawah) -->
        <div class="signature-section">
          <div>${namaKota}, ${tanggalSpm}</div>
          <div style="margin-top: 5px;"><strong>${kepalaBkadName}</strong></div>
          <div class="signature-space"></div>
          <div class="signature-line"></div>
          <div style="margin-top: 2px;"><strong>${kepalaBkadName}</strong></div>
          ${kepalaBkadNip ? `<div>NIP. ${kepalaBkadNip}</div>` : ''}
        </div>
        
        <!-- Print Button -->
        <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button 
            onclick="window.print()" 
            style="
              background-color: #2563eb;
              color: white;
              padding: 14px 28px;
              border: none;
              border-radius: 8px;
              font-size: 11pt;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
              font-family: 'Times New Roman', Times, serif;
            "
          >
            🖨️ Cetak Dokumen
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

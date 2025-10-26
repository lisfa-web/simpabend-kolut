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
  kopSuratUrl?: string | null,
  kepalaBkadName: string = "Kuasa Bendahara Umum Daerah",
  kepalaBkadNip: string = "",
  namaKota: string = "Samarinda"
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
        <title>Surat Perintah Pencairan Dana - ${spmData.nomor_spm}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
          }
          
          .kop-surat {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .kop-surat img {
            max-height: 100px;
            max-width: 100%;
          }
          
          .header-title {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .header-title h3 {
            margin: 0;
            font-size: 12pt;
            font-weight: bold;
          }
          
          h2 {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 5px 0 15px 0;
            text-decoration: underline;
          }
          
          .info-layout {
            display: table;
            width: 100%;
            margin-bottom: 15px;
          }
          
          .info-left,
          .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
          }
          
          .info-row {
            margin-bottom: 3px;
          }
          
          .info-label {
            display: inline-block;
            width: 120px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          
          table.bordered {
            border: 1px solid #000;
          }
          
          table.bordered td,
          table.bordered th {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
          }
          
          table.bordered th {
            font-weight: bold;
            text-align: center;
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
            margin: 10px 0 5px 0;
          }
          
          .bank-instruction {
            margin: 10px 0;
            line-height: 1.5;
          }
          
          .data-penerima {
            margin: 10px 0;
          }
          
          .data-penerima .row {
            margin-bottom: 3px;
          }
          
          .data-penerima .label {
            display: inline-block;
            width: 140px;
          }
          
          .footer-notes {
            margin-top: 15px;
            font-size: 9pt;
            line-height: 1.4;
          }
          
          .signature-section {
            margin-top: 30px;
            text-align: center;
          }
          
          .signature-space {
            height: 60px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            @page {
              margin: 1.5cm 2cm;
            }
          }
        </style>
      </head>
      <body>
        ${kopSuratUrl ? `
          <div class="kop-surat">
            <img src="${kopSuratUrl}" alt="Kop Surat" />
          </div>
        ` : ''}
        
        <h2>SURAT PERINTAH PENCAIRAN DANA</h2>
        
        <!-- Info Header 2 Kolom -->
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
        
        <!-- Bank / Pos -->
        <div class="bank-instruction">
          <strong>Bank / Pos:</strong> ${spmData.vendor?.nama_bank || '[Nama Bank]'}
          <br>
          Hendaklah mencairkan/memindahbukukan dari baki Rekening Nomor ${spmData.vendor?.nomor_rekening || '[No Rekening]'} 
          Uang sebesar <strong>Rp ${formatAngka(nilaiBersih)}</strong> 
          (${nilaiBersihTerbilang})
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
        
        <!-- Tabel Rincian -->
        <table class="bordered">
          <thead>
            <tr>
              <th style="width: 5%;">NO</th>
              <th style="width: 20%;">REKENING</th>
              <th style="width: 55%;">URAIAN</th>
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
            <tr>
              <td colspan="3" class="text-right"><strong>Jumlah</strong></td>
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
              <th style="width: 5%;">NO</th>
              <th style="width: 20%;">REKENING</th>
              <th style="width: 55%;">URAIAN</th>
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
            <tr>
              <td colspan="3" class="text-right"><strong>Jumlah Potongan</strong></td>
              <td class="text-right"><strong>Rp ${formatAngka(spmData.total_potongan || 0)}</strong></td>
            </tr>
          </tbody>
        </table>
        ` : ''}
        
        <!-- Informasi (SP2D yang Dibayarkan) -->
        <div class="section-title">Informasi (SP2D yang Dibayarkan):</div>
        <table class="bordered">
          <tbody>
            <tr>
              <td style="width: 70%;"><strong>Jumlah yang diminta</strong></td>
              <td class="text-right">Rp ${formatAngka(spmData.nilai_spm)}</td>
            </tr>
            <tr>
              <td><strong>Jumlah Potongan</strong></td>
              <td class="text-right">Rp ${formatAngka(spmData.total_potongan || 0)}</td>
            </tr>
            <tr>
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
          <div>Lembar 1: Bank Yang Ditunjuk</div>
          <div>Lembar 2: Pengguna Anggaran / Kuasa Pengguna Anggaran</div>
          <div>Lembar 3: Arsip Kuasa BUD</div>
          <div>Lembar 4: Pihak Ketiga (*)</div>
        </div>
        
        <!-- Tanda Tangan -->
        <div class="signature-section">
          <div>${namaKota}, ${tanggalSpm}</div>
          <div><strong>${kepalaBkadName}</strong></div>
          <div class="signature-space"></div>
          <div><strong>_______________________</strong></div>
          ${kepalaBkadNip ? `<div>NIP. ${kepalaBkadNip}</div>` : ''}
        </div>
        
        <!-- Print Button -->
        <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button 
            onclick="window.print()" 
            style="
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              font-size: 14pt;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            "
          >
            🖨️ Cetak Dokumen
          </button>
        </div>
        
        <style>
          @media print {
            button {
              display: none !important;
            }
          }
        </style>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

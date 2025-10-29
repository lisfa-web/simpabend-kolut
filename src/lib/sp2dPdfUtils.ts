import { formatCurrency } from "./currency";
import { terbilangRupiah, formatTanggalIndonesia, formatAngka } from "./formatHelpers";

interface Sp2dPrintData {
  nomor_sp2d: string;
  tanggal_sp2d: string;
  nilai_sp2d: number;
  nomor_rekening: string;
  nama_bank: string;
  nama_rekening: string;
  catatan?: string;
  total_potongan?: number;
  nilai_diterima?: number;
  potongan_pajak?: Array<{
    jenis_pajak: string;
    rekening_pajak?: string;
    uraian: string;
    jumlah_pajak: number;
  }>;
  spm?: {
    nomor_spm?: string;
    uraian?: string;
    opd?: {
      nama_opd: string;
    };
    vendor?: {
      nama_vendor?: string;
      npwp?: string;
    };
  };
}

export const generateSp2dPDF = (
  sp2dData: Sp2dPrintData,
  kopSuratUrl?: string | null,
  kuasaBudName: string = "KUASA BENDAHARA UMUM DAERAH",
  kuasaBudNip: string = ""
) => {
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    alert("Pop-up diblokir. Izinkan pop-up untuk mencetak PDF.");
    return;
  }

  const tahunAnggaran = new Date(sp2dData.tanggal_sp2d).getFullYear();
  const tanggalCetak = formatTanggalIndonesia(sp2dData.tanggal_sp2d);
  const nilaiTerbilang = terbilangRupiah(sp2dData.nilai_sp2d);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>SP2D - ${sp2dData.nomor_sp2d}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
          }
          
          .kop-surat {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .kop-surat img {
            max-height: 120px;
            max-width: 100%;
          }
          
          h2 {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0 20px 0;
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
            padding: 6px 8px;
            vertical-align: top;
          }
          
          table.bordered th {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          
          table.inner-table {
            border: none;
            margin: 0;
          }
          
          table.inner-table td {
            border: none;
            padding: 2px 4px;
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
          
          .uppercase {
            text-transform: uppercase;
          }
          
          .mt-2 {
            margin-top: 8px;
          }
          
          .mt-4 {
            margin-top: 16px;
          }
          
          .mt-8 {
            margin-top: 32px;
          }
          
          .mb-4 {
            margin-bottom: 16px;
          }
          
          p {
            margin: 8px 0;
          }
          
          .footer-lembar {
            margin-top: 16px;
            font-size: 10pt;
          }
          
          .footer-lembar p {
            margin: 4px 0;
          }
          
          .signature-section {
            margin-top: 40px;
            text-align: right;
          }
          
          .signature-space {
            height: 80px;
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
        
        <h2>SURAT PERINTAH PENCAIRAN DANA (SP2D)</h2>
        
        <!-- Tabel Header 2 Kolom -->
        <table class="bordered">
          <tr>
            <td style="width: 50%; padding: 12px;">
              <table class="inner-table">
                <tr>
                  <td style="width: 100px;">No. SPM</td>
                  <td style="width: 10px;">:</td>
                  <td>${sp2dData.spm?.nomor_spm || '-'}</td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td>:</td>
                  <td>${tanggalCetak}</td>
                </tr>
                <tr>
                  <td>SKPD</td>
                  <td>:</td>
                  <td>${sp2dData.spm?.opd?.nama_opd || '-'}</td>
                </tr>
              </table>
            </td>
            <td style="width: 50%; padding: 12px;">
              <table class="inner-table">
                <tr>
                  <td style="width: 130px;">Dari</td>
                  <td style="width: 10px;">:</td>
                  <td>Kuasa BUD</td>
                </tr>
                <tr>
                  <td>Nomor</td>
                  <td>:</td>
                  <td><strong>${sp2dData.nomor_sp2d}</strong></td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td>:</td>
                  <td>${tanggalCetak}</td>
                </tr>
                <tr>
                  <td>Tahun Anggaran</td>
                  <td>:</td>
                  <td>${tahunAnggaran}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Bank Tujuan -->
        <div class="mt-2">
          <strong>Bank / Pos: ${sp2dData.nama_bank}</strong>
        </div>
        
        <!-- Instruksi Pencairan -->
        <p class="mt-2">
          Hendaklah mencairkan / memindahbukukan dari Baki Rekening Nomor 
          <strong>${sp2dData.nomor_rekening}</strong> Uang sebesar 
          <strong>${formatCurrency(sp2dData.nilai_sp2d)}</strong>
        </p>
        
        <!-- Data Penerima -->
        <table class="mt-2">
          <tr>
            <td style="width: 150px;">Kepada</td>
            <td style="width: 10px;">:</td>
            <td><strong>${sp2dData.nama_rekening}</strong></td>
          </tr>
          <tr>
            <td>NPWP</td>
            <td>:</td>
            <td>${sp2dData.spm?.vendor?.npwp || '-'}</td>
          </tr>
          <tr>
            <td>No. Rekening Bank</td>
            <td>:</td>
            <td>${sp2dData.nomor_rekening}</td>
          </tr>
          <tr>
            <td>Bank / Pos</td>
            <td>:</td>
            <td>${sp2dData.nama_bank}</td>
          </tr>
          <tr>
            <td>Keperluan Untuk</td>
            <td>:</td>
            <td>${sp2dData.spm?.uraian || '-'}</td>
          </tr>
        </table>
        
        <!-- Tabel Rincian -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th style="width: 40px;">NO.</th>
              <th style="width: 120px;">REKENING</th>
              <th>URAIAN</th>
              <th style="width: 150px;" class="text-right">JUMLAH (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">1</td>
              <td>-</td>
              <td>${sp2dData.spm?.uraian || '-'}</td>
              <td class="text-right">${formatAngka(sp2dData.nilai_sp2d)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right"><strong>JUMLAH</strong></td>
              <td class="text-right"><strong>${formatAngka(sp2dData.nilai_sp2d)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Tabel Potongan -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="4"><strong>Potongan-potongan:</strong></th>
            </tr>
            <tr>
              <th style="width: 40px;">NO.</th>
              <th style="width: 120px;">REKENING</th>
              <th>URAIAN</th>
              <th style="width: 150px;" class="text-right">JUMLAH (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${sp2dData.potongan_pajak && sp2dData.potongan_pajak.length > 0
              ? sp2dData.potongan_pajak.map((pajak, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${pajak.rekening_pajak || '-'}</td>
                  <td>${pajak.uraian}</td>
                  <td class="text-right">${formatAngka(pajak.jumlah_pajak)}</td>
                </tr>
              `).join('')
              : `
                <tr>
                  <td class="text-center">-</td>
                  <td>-</td>
                  <td>Tidak ada potongan</td>
                  <td class="text-right">0</td>
                </tr>
              `
            }
            <tr>
              <td colspan="3" class="text-right"><strong>JUMLAH</strong></td>
              <td class="text-right"><strong>${formatAngka(sp2dData.total_potongan || 0)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <!-- Tabel Informasi (opsional) -->
        ${sp2dData.catatan ? `
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th><strong>Informasi</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${sp2dData.catatan}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}
        
        <!-- Ringkasan SP2D -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="2"><strong>SP2D yang Dibayarkan</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 60%;">Jumlah yang diminta</td>
              <td class="text-right">Rp ${formatAngka(sp2dData.nilai_sp2d)}</td>
            </tr>
            <tr>
              <td>Jumlah Potongan</td>
              <td class="text-right">Rp ${formatAngka(sp2dData.total_potongan || 0)}</td>
            </tr>
            <tr>
              <td><strong>Jumlah yang Dibayarkan</strong></td>
              <td class="text-right"><strong>Rp ${formatAngka(sp2dData.nilai_diterima || sp2dData.nilai_sp2d)}</strong></td>
            </tr>
            <tr>
              <td colspan="2">
                <strong>Uang Sejumlah:</strong><br>
                <em>${terbilangRupiah(sp2dData.nilai_diterima || sp2dData.nilai_sp2d)}</em>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer Lembar -->
        <div class="footer-lembar">
          <p><strong>Lembar 1:</strong> Bank Yang Ditunjuk</p>
          <p><strong>Lembar 2:</strong> Pengguna Anggaran / Kuasa Pengguna Anggaran</p>
          <p><strong>Lembar 3:</strong> Arsip Kuasa BUD</p>
          <p><strong>Lembar 4:</strong> Pihak Ketiga</p>
        </div>
        
        <!-- Tanda Tangan -->
        <div class="signature-section">
          <p>${tanggalCetak}</p>
          <p><strong class="uppercase">${kuasaBudName}</strong></p>
          <div class="signature-space"></div>
          <p><strong>_______________________</strong></p>
          ${kuasaBudNip ? `<p>NIP. ${kuasaBudNip}</p>` : ''}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

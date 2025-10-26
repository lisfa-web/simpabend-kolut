import { formatCurrency } from "./currency";
import { terbilangRupiah, formatTanggalIndonesia, formatAngka } from "./formatHelpers";

interface SpmPrintData {
  nomor_spm: string;
  tanggal_ajuan: string;
  nilai_spm: number;
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
}

export const generateSpmPDF = (
  spmData: SpmPrintData,
  kopSuratUrl?: string | null,
  kepalaBkadName: string = "KEPALA BADAN KEUANGAN DAN ASET DAERAH",
  kepalaBkadNip: string = ""
) => {
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    alert("Pop-up diblokir. Izinkan pop-up untuk mencetak PDF.");
    return;
  }

  const tahunAnggaran = new Date(spmData.tanggal_ajuan).getFullYear();
  const tanggalCetak = formatTanggalIndonesia(spmData.tanggal_ajuan);
  const nilaiTerbilang = terbilangRupiah(spmData.nilai_spm);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>SPM - ${spmData.nomor_spm}</title>
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
          
          p {
            margin: 8px 0;
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
        
        <h2>SURAT PERINTAH MEMBAYAR (SPM)</h2>
        
        <!-- Info Header -->
        <table class="mt-2">
          <tr>
            <td style="width: 150px;">Nomor SPM</td>
            <td style="width: 10px;">:</td>
            <td><strong>${spmData.nomor_spm}</strong></td>
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
          <tr>
            <td>Jenis SPM</td>
            <td>:</td>
            <td class="uppercase">${spmData.jenis_spm.replace('_', ' ')}</td>
          </tr>
          ${spmData.nomor_berkas ? `
          <tr>
            <td>Nomor Berkas</td>
            <td>:</td>
            <td>${spmData.nomor_berkas}</td>
          </tr>
          ` : ''}
        </table>
        
        <!-- Data OPD -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="2">DATA ORGANISASI PERANGKAT DAERAH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 200px;"><strong>Nama SKPD</strong></td>
              <td>${spmData.opd?.nama_opd || '-'}</td>
            </tr>
            <tr>
              <td><strong>Kode SKPD</strong></td>
              <td>${spmData.opd?.kode_opd || '-'}</td>
            </tr>
            <tr>
              <td><strong>Bendahara</strong></td>
              <td>${spmData.bendahara?.full_name || '-'}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Data Program/Kegiatan -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="2">DATA PROGRAM DAN KEGIATAN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 200px;"><strong>Program</strong></td>
              <td>${spmData.program?.nama_program || '-'}</td>
            </tr>
            <tr>
              <td><strong>Kode Program</strong></td>
              <td>${spmData.program?.kode_program || '-'}</td>
            </tr>
            <tr>
              <td><strong>Kegiatan</strong></td>
              <td>${spmData.kegiatan?.nama_kegiatan || '-'}</td>
            </tr>
            <tr>
              <td><strong>Kode Kegiatan</strong></td>
              <td>${spmData.kegiatan?.kode_kegiatan || '-'}</td>
            </tr>
            <tr>
              <td><strong>Sub Kegiatan</strong></td>
              <td>${spmData.subkegiatan?.nama_subkegiatan || '-'}</td>
            </tr>
            <tr>
              <td><strong>Kode Sub Kegiatan</strong></td>
              <td>${spmData.subkegiatan?.kode_subkegiatan || '-'}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Data Penerima -->
        ${spmData.vendor ? `
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="2">DATA PENERIMA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 200px;"><strong>Nama Penerima</strong></td>
              <td>${spmData.vendor.nama_vendor || '-'}</td>
            </tr>
            <tr>
              <td><strong>NPWP</strong></td>
              <td>${spmData.vendor.npwp || '-'}</td>
            </tr>
            <tr>
              <td><strong>Nama Bank</strong></td>
              <td>${spmData.vendor.nama_bank || '-'}</td>
            </tr>
            <tr>
              <td><strong>Nomor Rekening</strong></td>
              <td>${spmData.vendor.nomor_rekening || '-'}</td>
            </tr>
            <tr>
              <td><strong>Nama Rekening</strong></td>
              <td>${spmData.vendor.nama_rekening || '-'}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}
        
        <!-- Uraian & Nilai -->
        <table class="bordered mt-4">
          <thead>
            <tr>
              <th colspan="2">URAIAN DAN NILAI SPM</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 200px;"><strong>Uraian</strong></td>
              <td>${spmData.uraian || '-'}</td>
            </tr>
            <tr>
              <td><strong>Nilai SPM</strong></td>
              <td><strong>Rp ${formatAngka(spmData.nilai_spm)}</strong></td>
            </tr>
            <tr>
              <td colspan="2">
                <strong>Terbilang:</strong><br>
                <em>${nilaiTerbilang}</em>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Tanda Tangan -->
        <div class="signature-section">
          <p>${tanggalCetak}</p>
          <p><strong class="uppercase">${kepalaBkadName}</strong></p>
          <div class="signature-space"></div>
          <p><strong>_______________________</strong></p>
          ${kepalaBkadNip ? `<p>NIP. ${kepalaBkadNip}</p>` : ''}
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

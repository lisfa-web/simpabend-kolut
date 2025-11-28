import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface ExportColumn {
  header: string;
  accessor: (item: any, index?: number) => any;
}

// Export data to CSV format (Excel compatible)
export const exportToExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  if (!data || data.length === 0) {
    return;
  }

  // Build CSV content with BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  
  // Header row
  const headers = columns.map(col => `"${col.header}"`).join(",");
  
  // Data rows
  const rows = data.map((item, index) => {
    return columns.map(col => {
      let value = col.accessor(item, index);
      
      // Format value based on type
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === "number") {
        return value.toString();
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(",");
  });

  const csvContent = BOM + headers + "\n" + rows.join("\n");
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Predefined columns for different data types
export const arsipSpmColumns: ExportColumn[] = [
  { header: "No", accessor: (_, i) => (i || 0) + 1 },
  { header: "Nomor SPM", accessor: (item) => item.nomor_spm || "-" },
  { header: "Tanggal SPM", accessor: (item) => item.tanggal_spm ? format(new Date(item.tanggal_spm), "dd/MM/yyyy", { locale: id }) : "-" },
  { header: "OPD", accessor: (item) => item.opd?.nama_opd || "-" },
  { header: "Penerima", accessor: (item) => item.nama_penerima || "-" },
  { header: "Nilai SPM", accessor: (item) => item.nilai_spm || 0 },
  { header: "Nilai Bersih", accessor: (item) => item.nilai_bersih || 0 },
  { header: "Status", accessor: (item) => item.status || "-" },
  { header: "Tanggal Arsip", accessor: (item) => item.archived_at ? format(new Date(item.archived_at), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
];

export const arsipSp2dColumns: ExportColumn[] = [
  { header: "No", accessor: (_, i) => (i || 0) + 1 },
  { header: "Nomor SP2D", accessor: (item) => item.nomor_sp2d || "-" },
  { header: "Tanggal SP2D", accessor: (item) => item.tanggal_sp2d ? format(new Date(item.tanggal_sp2d), "dd/MM/yyyy", { locale: id }) : "-" },
  { header: "OPD", accessor: (item) => item.opd?.nama_opd || "-" },
  { header: "Nilai SP2D", accessor: (item) => item.nilai_sp2d || 0 },
  { header: "Nilai Diterima", accessor: (item) => item.nilai_diterima || 0 },
  { header: "Status", accessor: (item) => item.status || "-" },
  { header: "Tanggal Arsip", accessor: (item) => item.archived_at ? format(new Date(item.archived_at), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
];

export const timelineSpmColumns: ExportColumn[] = [
  { header: "No", accessor: (_, i) => (i || 0) + 1 },
  { header: "Nomor SPM", accessor: (item) => item.nomor_spm || "-" },
  { header: "Tanggal Ajuan", accessor: (item) => item.tanggal_ajuan ? format(new Date(item.tanggal_ajuan), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "OPD", accessor: (item) => item.opd?.nama_opd || "-" },
  { header: "Penerima", accessor: (item) => item.nama_penerima || "-" },
  { header: "Nilai SPM", accessor: (item) => item.nilai_spm || 0 },
  { header: "Status", accessor: (item) => item.status || "-" },
  { header: "Tgl Resepsionis", accessor: (item) => item.tanggal_resepsionis ? format(new Date(item.tanggal_resepsionis), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl PBMD", accessor: (item) => item.tanggal_pbmd ? format(new Date(item.tanggal_pbmd), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl Akuntansi", accessor: (item) => item.tanggal_akuntansi ? format(new Date(item.tanggal_akuntansi), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl Perbendaharaan", accessor: (item) => item.tanggal_perbendaharaan ? format(new Date(item.tanggal_perbendaharaan), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl Kepala BKAD", accessor: (item) => item.tanggal_kepala_bkad ? format(new Date(item.tanggal_kepala_bkad), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
];

export const timelineSp2dColumns: ExportColumn[] = [
  { header: "No", accessor: (_, i) => (i || 0) + 1 },
  { header: "Nomor SP2D", accessor: (item) => item.nomor_sp2d || "-" },
  { header: "Nomor SPM", accessor: (item) => item.spm?.nomor_spm || "-" },
  { header: "Tanggal SP2D", accessor: (item) => item.tanggal_sp2d ? format(new Date(item.tanggal_sp2d), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "OPD", accessor: (item) => item.spm?.opd?.nama_opd || "-" },
  { header: "Penerima", accessor: (item) => item.spm?.nama_penerima || "-" },
  { header: "Nilai SP2D", accessor: (item) => item.nilai_sp2d || 0 },
  { header: "Status", accessor: (item) => item.status || "-" },
  { header: "Tgl Kirim Bank", accessor: (item) => item.tanggal_kirim_bank ? format(new Date(item.tanggal_kirim_bank), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl Konfirmasi Bank", accessor: (item) => item.tanggal_konfirmasi_bank ? format(new Date(item.tanggal_konfirmasi_bank), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
  { header: "Tgl Cair", accessor: (item) => item.tanggal_cair ? format(new Date(item.tanggal_cair), "dd/MM/yyyy HH:mm", { locale: id }) : "-" },
];

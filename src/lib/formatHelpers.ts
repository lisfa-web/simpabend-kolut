import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// Konversi angka ke terbilang Indonesia
export const terbilang = (angka: number): string => {
  const huruf = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan",
    "Sepuluh", "Sebelas"
  ];

  if (angka < 12) {
    return huruf[angka];
  } else if (angka < 20) {
    return terbilang(angka - 10) + " Belas";
  } else if (angka < 100) {
    return terbilang(Math.floor(angka / 10)) + " Puluh " + terbilang(angka % 10);
  } else if (angka < 200) {
    return "Seratus " + terbilang(angka - 100);
  } else if (angka < 1000) {
    return terbilang(Math.floor(angka / 100)) + " Ratus " + terbilang(angka % 100);
  } else if (angka < 2000) {
    return "Seribu " + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    return terbilang(Math.floor(angka / 1000)) + " Ribu " + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    return terbilang(Math.floor(angka / 1000000)) + " Juta " + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    return terbilang(Math.floor(angka / 1000000000)) + " Miliar " + terbilang(angka % 1000000000);
  } else if (angka < 1000000000000000) {
    return terbilang(Math.floor(angka / 1000000000000)) + " Triliun " + terbilang(angka % 1000000000000);
  } else {
    return "Angka terlalu besar";
  }
};

// Format angka ke terbilang rupiah
export const terbilangRupiah = (angka: number): string => {
  if (angka === 0) return "Nol Rupiah";
  
  const bilangan = terbilang(Math.floor(angka)).trim();
  return bilangan + " Rupiah";
};

// Format tanggal ke Indonesia
export const formatTanggalIndonesia = (date: string | Date): string => {
  try {
    return format(new Date(date), "dd MMMM yyyy", { locale: localeId });
  } catch {
    return "-";
  }
};

// Format tanggal pendek
export const formatTanggalPendek = (date: string | Date): string => {
  try {
    return format(new Date(date), "dd/MM/yyyy");
  } catch {
    return "-";
  }
};

// Format currency tanpa simbol untuk table
export const formatAngka = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format jenis SPM ke label yang readable
export const formatJenisSpm = (jenis: string | { nama_jenis: string } | undefined): string => {
  if (!jenis) return "-";
  
  // Handle if jenis is an object with nama_jenis property
  const jenisStr = typeof jenis === 'string' ? jenis : jenis.nama_jenis;
  if (!jenisStr) return "-";
  
  const labels: Record<string, string> = {
    up: "UP",
    gu: "GU", 
    tu: "TU",
    ls_gaji: "LS Gaji",
    ls_barang_jasa: "LS Barang Jasa",
    ls_belanja_modal: "LS Belanja Modal"
  };
  
  return labels[jenisStr.toLowerCase()] || jenisStr;
};

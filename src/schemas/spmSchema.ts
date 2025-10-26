import { z } from 'zod';

export const spmDataSchema = z.object({
  opd_id: z.string().uuid('OPD harus dipilih'),
  program_id: z.string().uuid('Program harus dipilih'),
  kegiatan_id: z.string().uuid('Kegiatan harus dipilih'),
  subkegiatan_id: z.string().uuid('Sub Kegiatan harus dipilih'),
  jenis_spm: z.enum(['UP', 'GU', 'TU', 'LS_Gaji', 'LS_Barang_Jasa', 'LS_Belanja_Modal'], {
    errorMap: () => ({ message: 'Jenis SPM harus dipilih' }),
  }),
  nilai_spm: z.number().min(1000, 'Nilai minimal Rp 1.000'),
  uraian: z.string().min(10, 'Uraian minimal 10 karakter'),
  tanggal_ajuan: z.date(),
  vendor_id: z.string().uuid().optional(),
  nama_bank: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
}).refine((data) => {
  // Vendor wajib diisi untuk jenis LS tertentu
  const requiresVendor = ['LS_Barang_Jasa', 'LS_Belanja_Modal'];
  if (requiresVendor.includes(data.jenis_spm)) {
    return !!data.vendor_id;
  }
  return true;
}, {
  message: 'Vendor wajib diisi untuk SPM jenis LS yang dipilih',
  path: ['vendor_id'],
});

export type SpmDataFormValues = z.infer<typeof spmDataSchema>;

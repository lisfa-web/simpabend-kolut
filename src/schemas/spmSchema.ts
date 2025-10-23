import { z } from 'zod';

export const spmDataSchema = z.object({
  opd_id: z.string().uuid('OPD harus dipilih'),
  program_id: z.string().uuid('Program harus dipilih'),
  kegiatan_id: z.string().uuid('Kegiatan harus dipilih'),
  subkegiatan_id: z.string().uuid('Sub Kegiatan harus dipilih'),
  jenis_spm: z.enum(['up', 'gu', 'tu', 'ls_gaji', 'ls_barang_jasa', 'ls_belanja_modal'], {
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
  // Jika jenis SPM adalah LS, vendor wajib diisi
  if (data.jenis_spm.startsWith('ls_')) {
    return !!data.vendor_id;
  }
  return true;
}, {
  message: 'Vendor wajib diisi untuk SPM LS',
  path: ['vendor_id'],
});

export type SpmDataFormValues = z.infer<typeof spmDataSchema>;

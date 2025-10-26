export const JENIS_SPM_OPTIONS = [
  { value: 'up', label: 'UP (Uang Persediaan)' },
  { value: 'gu', label: 'GU (Ganti Uang)' },
  { value: 'tu', label: 'TU (Tambah Uang)' },
  { value: 'ls_gaji', label: 'LS Gaji' },
  { value: 'ls_barang_jasa', label: 'LS Barang & Jasa' },
  { value: 'ls_belanja_modal', label: 'LS Belanja Modal' },
] as const;

export const getJenisSpmLabel = (value: string): string => {
  const option = JENIS_SPM_OPTIONS.find(opt => opt.value === value);
  if (option) return option.label;
  
  // Fallback: capitalize and replace underscores
  return value.toUpperCase().replace(/_/g, ' ');
};

export const JENIS_SPM_OPTIONS = [
  { value: 'UP', label: 'UP (Uang Persediaan)' },
  { value: 'GU', label: 'GU (Ganti Uang)' },
  { value: 'TU', label: 'TU (Tambah Uang)' },
  { value: 'LS_Gaji', label: 'LS Gaji' },
  { value: 'LS_Barang_Jasa', label: 'LS Barang & Jasa' },
  { value: 'LS_Belanja_Modal', label: 'LS Belanja Modal' },
] as const;

export const getJenisSpmLabel = (value: string): string => {
  const option = JENIS_SPM_OPTIONS.find(opt => opt.value === value);
  if (option) return option.label;
  
  // Fallback: format display for any value
  return value.replace(/_/g, ' ');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove all non-digit characters except dots and commas
  const cleanValue = value.replace(/[^\d]/g, '');
  return parseInt(cleanValue) || 0;
};

export const formatCurrencyInput = (value: string): string => {
  const number = parseCurrency(value);
  if (number === 0) return '';
  
  return number.toLocaleString('id-ID');
};

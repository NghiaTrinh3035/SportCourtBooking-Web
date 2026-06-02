export const formatCurrency = (value?: number): string => {
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

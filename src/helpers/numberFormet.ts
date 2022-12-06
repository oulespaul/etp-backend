export const formatNumber = (amount, digit = 2) => {
  const number = Number.parseFloat(amount);
  if (Number.isNaN(number)) {
    return '';
  }
  return number.toLocaleString('th-TH', {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
};

/**
 * Formats an amount with status-based prefix and US currency formatting.
 *
 * @param amount - Numeric amount value (e.g., 1234.5)
 * @param status - Transaction status ("FAILED" for negative, any other for positive)
 * @returns Formatted currency string like "+$1,234.50" or "-$1,234.50"
 */
export const formatAmount = (amount: number, status: string): string => {
  const prefix = status === 'FAILED' ? '-' : '+';
  return `${prefix}$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

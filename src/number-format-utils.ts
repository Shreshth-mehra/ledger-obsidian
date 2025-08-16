import { ISettings } from './settings';

/**
 * Formats a number according to the selected notation system
 * @param value - The number to format
 * @param notationSystem - The notation system to use ('lakh' or 'million')
 * @returns Formatted string representation
 */
export const formatNumber = (value: number, notationSystem: 'lakh' | 'million'): string => {
  if (notationSystem === 'lakh') {
    return formatLakhCrore(value);
  } else {
    return formatMillionBillion(value);
  }
};

/**
 * Formats numbers using Indian notation (L for Lakh, Cr for Crore)
 * @param value - The number to format
 * @returns Formatted string
 */
const formatLakhCrore = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) { // 1 Crore = 10,000,000
    return `${sign}${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) { // 1 Lakh = 100,000
    return `${sign}${(absValue / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) { // 1 Thousand = 1,000
    return `${sign}${(absValue / 1000).toFixed(1)}k`;
  } else {
    return value.toString();
  }
};

/**
 * Formats numbers using Western notation (M for Million, B for Billion)
 * @param value - The number to format
 * @returns Formatted string
 */
const formatMillionBillion = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000000) { // 1 Billion = 1,000,000,000
    return `${sign}${(absValue / 1000000000).toFixed(1)}B`;
  } else if (absValue >= 1000000) { // 1 Million = 1,000,000
    return `${sign}${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) { // 1 Thousand = 1,000
    return `${sign}${(absValue / 1000).toFixed(1)}k`;
  } else {
    return value.toString();
  }
};

/**
 * Formats currency values with the specified notation system
 * @param value - The number to format
 * @param currencySymbol - The currency symbol to prepend
 * @param notationSystem - The notation system to use
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currencySymbol: string, 
  notationSystem: 'lakh' | 'million'
): string => {
  const formattedNumber = formatNumber(value, notationSystem);
  return `${currencySymbol}${formattedNumber}`;
};

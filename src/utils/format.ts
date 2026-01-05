/**
 * 숫자 포맷팅 유틸리티
 * 1,234 / 12.3K / 4.56M / 7.89B 형식
 */

export function formatNumber(num: number, decimals: number = 1): string {
  if (num < 1000) {
    return Math.floor(num).toString();
  }

  if (num < 1_000_000) {
    return (num / 1000).toFixed(decimals).replace(/\.?0+$/, '') + 'K';
  }

  if (num < 1_000_000_000) {
    return (num / 1_000_000).toFixed(decimals).replace(/\.?0+$/, '') + 'M';
  }

  if (num < 1_000_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals).replace(/\.?0+$/, '') + 'B';
  }

  return (num / 1_000_000_000_000).toFixed(decimals).replace(/\.?0+$/, '') + 'T';
}

/**
 * 천 단위 구분 포맷팅 (1,234)
 */
export function formatNumberWithCommas(num: number): string {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 백분율 포맷팅
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

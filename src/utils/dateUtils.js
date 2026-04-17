/**
 * Returns the closest price from the dataset for a given time.
 * If the exact time exists, returns that. 
 * Otherwise, finds the closest date (either before or after) to handle weekends/holidays.
 * 
 * @param {string} targetTime - Date string 'YYYY-MM-DD'
 * @param {Array} data - Array of {time: string, value: number} or {time: string, close: number}
 * @returns {number|null} - The price closest to given date, or null if empty
 */
export function getClosestPrice(targetTime, data) {
  if (!data || data.length === 0) return null;

  const target = new Date(targetTime).getTime();
  
  let closestPrice = null;
  let minDiff = Infinity;

  // Lightweight charts might give string times for daily data
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const pointTime = new Date(point.time).getTime();
    const diff = Math.abs(pointTime - target);
    
    if (diff < minDiff) {
      minDiff = diff;
      closestPrice = point.value !== undefined ? point.value : point.close;
    }
    
    // Since data is sorted chronologically, if the difference starts increasing, 
    // we've passed the closest point. We can early exit.
    if (targetTime < pointTime && diff > minDiff) {
      break; 
    }
  }

  return closestPrice;
}

/**
 * Format a YYYY-MM-DD string to a readable format
 */
export function formatDateReadable(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(y, parseInt(m) - 1, d);
  return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
}

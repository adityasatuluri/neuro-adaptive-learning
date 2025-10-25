/**
 * Format time duration into human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted time string (e.g., "43 seconds", "12 minutes", "1.3 hours")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`
  }

  const hours = minutes / 60
  return `${hours.toFixed(1)} hours`
}

/**
 * Format average time per question
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export function formatAverageTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }

  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}

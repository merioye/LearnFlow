/**
 * Utility function for retrying operations
 */
/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay between retries in ms
 * @returns Promise resolving to the function result and number of attempts
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number
): Promise<{ result: T; attempts: number }> {
  let attempts = 0;
  let delay = initialDelay;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const result = await fn();
      return { result, attempts };
    } catch (error) {
      attempts++;

      if (attempts >= maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.3 + 0.85; // Random factor between 0.85 and 1.15
      delay = delay * 2 * jitter;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processQueue<T>(
  queue: T[],
  processFn: (item: T) => Promise<void>,
  delayMs: number = 700,
) {
  for (const item of queue) {
    await processFn(item);
    await delay(delayMs);
  }
}

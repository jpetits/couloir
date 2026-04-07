const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processQueue<T>(
  queue: T[],
  processFn: (item: T, index: number) => Promise<void>,
  delayMs: number = 700,
) {
  for (const [index, item] of queue.entries()) {
    await processFn(item, index);
    await delay(delayMs);
  }
}

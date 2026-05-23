import { Injectable } from "@nestjs/common";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class QueueService {
  async processQueue<T>(
    queue: T[],
    processFn: (item: T, index: number) => Promise<void>,
    delayMs: number = 300,
  ) {
    for (const [index, item] of queue.entries()) {
      await processFn(item, index);
      await delay(delayMs);
    }
  }
}

import { RateLimitError } from "@/core/domain/errors";
import type { IRateLimiter } from "@/core/domain/contracts";

/**
 * Sliding-window limiter held in process memory.
 * Good for a single instance; implement IRateLimiter with Redis/Upstash for multi-region deployments.
 */
export class InMemoryRateLimiter implements IRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string): void {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.windowMs);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      throw new RateLimitError();
    }

    recent.push(now);
    this.hits.set(key, recent);

    if (this.hits.size > 5_000) this.prune(now);
  }

  private prune(now: number): void {
    for (const [key, times] of this.hits) {
      if (times.every((time) => now - time >= this.windowMs)) this.hits.delete(key);
    }
  }
}

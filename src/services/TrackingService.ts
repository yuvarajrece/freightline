import type { ITrackingRepository } from "@/core/domain/contracts";
import { NotFoundError } from "@/core/domain/errors";
import type { TrackingResult } from "@/core/domain/models";
import { parseOrThrow, trackSchema } from "@/core/validation/schemas";

export class TrackingService {
  constructor(private readonly tracking: ITrackingRepository) {}

  async track(raw: unknown): Promise<TrackingResult> {
    const { code } = parseOrThrow(trackSchema, raw);
    const result = await this.tracking.findByCode(code);
    if (!result) throw new NotFoundError("No consignment found for that code. Check it and try again.");
    return result;
  }
}

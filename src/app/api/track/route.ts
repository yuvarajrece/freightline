import { jsonError, jsonOk, clientIp } from "@/lib/http";
import { InMemoryRateLimiter } from "@/lib/rate-limit";
import { getPublicContainer } from "@/services/container";

const limiter = new InMemoryRateLimiter(20, 60_000);

export async function GET(request: Request) {
  try {
    limiter.consume(clientIp(request));
    const code = new URL(request.url).searchParams.get("code");
    const result = await getPublicContainer().trackingService.track({ code });
    return jsonOk({ result });
  } catch (error) {
    return jsonError(error);
  }
}

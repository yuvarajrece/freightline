import { createPostHandler } from "@/lib/http";
import { getPublicContainer } from "@/services/container";

export const POST = createPostHandler({
  limit: 5,
  windowMs: 60_000,
  successStatus: 200,
  run: (body) => getPublicContainer().leadService.subscribe(body),
});

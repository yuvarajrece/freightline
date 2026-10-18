import { createPostHandler } from "@/lib/http";
import { getPublicContainer } from "@/services/container";

export const POST = createPostHandler({
  limit: 5,
  windowMs: 60_000,
  run: (body) => getPublicContainer().leadService.submitContact(body),
});

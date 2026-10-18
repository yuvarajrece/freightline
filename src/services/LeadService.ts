import type { IInsertOnlyRepository, ISubscriberRepository } from "@/core/domain/contracts";
import type { NewContactMessage, NewQuoteRequest } from "@/core/domain/models";
import { contactSchema, parseOrThrow, quoteSchema, subscribeSchema } from "@/core/validation/schemas";

/** Validates and stores everything visitors send us. */
export class LeadService {
  constructor(
    private readonly quotes: IInsertOnlyRepository<NewQuoteRequest>,
    private readonly messages: IInsertOnlyRepository<NewContactMessage>,
    private readonly subscribers: Pick<ISubscriberRepository, "subscribe">,
  ) {}

  async submitQuote(raw: unknown): Promise<void> {
    const input = parseOrThrow(quoteSchema, raw);
    await this.quotes.insert(input);
  }

  async submitContact(raw: unknown): Promise<void> {
    const input = parseOrThrow(contactSchema, raw);
    await this.messages.insert(input);
  }

  async subscribe(raw: unknown): Promise<void> {
    const { email } = parseOrThrow(subscribeSchema, raw);
    await this.subscribers.subscribe(email);
  }
}

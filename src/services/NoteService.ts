import type { INoteRepository } from "@/core/domain/contracts";
import type { AdminNote, NoteEntityType } from "@/core/domain/models";
import { noteSchema, parseOrThrow } from "@/core/validation/schemas";

export class NoteService {
  constructor(private readonly notes: INoteRepository) {}

  listForEntity(type: NoteEntityType, entityId: string | null): Promise<AdminNote[]> {
    return this.notes.listForEntity(type, entityId);
  }

  /** All notes attached to any record of a type (e.g. every quote), for grouping in one query. */
  listByType(type: NoteEntityType): Promise<AdminNote[]> {
    return this.notes.list({
      filters: { entity_type: type },
      orderBy: { column: "updated_at", ascending: false },
      limit: 2000,
    });
  }

  async listGeneral(): Promise<AdminNote[]> {
    return this.notes.listForEntity("general", null);
  }

  async create(raw: unknown, authorEmail: string): Promise<AdminNote> {
    const input = parseOrThrow(noteSchema, raw);
    return this.notes.create({ ...input, author_email: authorEmail });
  }

  async update(id: string, raw: unknown): Promise<AdminNote> {
    const input = parseOrThrow(noteSchema, raw);
    return this.notes.update(id, {
      title: input.title,
      body: input.body,
      pinned: input.pinned,
    });
  }

  async setPinned(id: string, pinned: boolean): Promise<AdminNote> {
    return this.notes.update(id, { pinned });
  }

  remove(id: string): Promise<void> {
    return this.notes.remove(id);
  }
}

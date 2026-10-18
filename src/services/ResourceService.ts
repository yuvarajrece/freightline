import type { IRepository } from "@/core/domain/contracts";
import { NotFoundError } from "@/core/domain/errors";
import {
  RESOURCES,
  type ResourceConfig,
  type ResourceKey,
  type SelectOption,
} from "@/core/config/resources";
import { buildObjectSchema } from "@/core/validation/dynamic";
import { parseOrThrow } from "@/core/validation/schemas";

export type ResourceRow = { id: string } & Record<string, unknown>;
export type ResourceRepository = IRepository<ResourceRow, Record<string, unknown>, Record<string, unknown>>;

/** Which column to show as the label when a resource is referenced by another. */
const RELATION_LABEL: Partial<Record<ResourceKey, string>> = {
  locations: "name",
};

/**
 * Generic CRUD for every entry in the RESOURCES registry.
 * Validation is generated from the registry, so this class never changes when content types are added.
 */
export class ResourceService {
  constructor(private readonly repositories: Record<ResourceKey, ResourceRepository>) {}

  config(key: ResourceKey): ResourceConfig {
    return RESOURCES[key];
  }

  list(key: ResourceKey): Promise<ResourceRow[]> {
    const { orderBy } = RESOURCES[key];
    return this.repositories[key].list({ orderBy, limit: 500 });
  }

  get(key: ResourceKey, id: string): Promise<ResourceRow | null> {
    return this.repositories[key].findById(id);
  }

  async save(key: ResourceKey, id: string | null, raw: unknown): Promise<ResourceRow> {
    const config = RESOURCES[key];
    const parsed = parseOrThrow(buildObjectSchema(config.fields), raw) as Record<string, unknown>;
    const repository = this.repositories[key];

    // Empty "generated" fields (e.g. tracking code) are left to the database default.
    const values = Object.fromEntries(
      Object.entries(parsed).filter(([name, value]) => {
        const field = config.fields.find((f) => f.name === name);
        return !(field?.generated && (value === null || value === undefined));
      }),
    );

    if (id) {
      if (!(await repository.findById(id))) throw new NotFoundError();
      return repository.update(id, values);
    }

    // On create, omit empty values so database defaults (e.g. generated tracking codes) apply.
    const insertable = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== null && value !== undefined),
    );
    return repository.create(insertable);
  }

  remove(key: ResourceKey, id: string): Promise<void> {
    return this.repositories[key].remove(id);
  }

  /** Dropdown options for every relation field of a resource, keyed by the related resource. */
  async relationOptions(key: ResourceKey): Promise<Partial<Record<ResourceKey, SelectOption[]>>> {
    const related = new Set<ResourceKey>();
    for (const field of RESOURCES[key].fields) {
      if (field.type === "relation" && field.relation) related.add(field.relation);
    }

    const entries = await Promise.all(
      [...related].map(async (relationKey) => {
        const labelField = RELATION_LABEL[relationKey] ?? "name";
        const rows = await this.list(relationKey);
        const options = rows.map((row) => ({ value: row.id, label: String(row[labelField] ?? row.id) }));
        return [relationKey, options] as const;
      }),
    );
    return Object.fromEntries(entries);
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "@/core/domain/errors";
import type {
  FilterValue,
  IRepository,
  ListOptions,
  OrderBy,
} from "@/core/domain/contracts";

interface DbError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Generic table repository. Concrete repositories extend it (or use it directly)
 * and add only what is specific to their table (Single Responsibility, Open/Closed).
 */
export class SupabaseRepository<
  T extends { id: string },
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
> implements IRepository<T, TCreate, TUpdate>
{
  constructor(
    protected readonly client: SupabaseClient,
    protected readonly table: string,
    protected readonly defaultOrder: OrderBy = { column: "created_at", ascending: false },
  ) {}

  protected fail(error: DbError): RepositoryError {
    return new RepositoryError(`${this.table}: ${error.message}`, { code: error.code, details: error.details });
  }

  async list(options: ListOptions = {}): Promise<T[]> {
    let query = this.client.from(this.table).select("*");

    if (options.onlyPublished) query = query.eq("is_published", true);
    if (options.createdSince) query = query.gte("created_at", options.createdSince);
    for (const [column, value] of Object.entries(options.filters ?? {})) {
      query = query.eq(column, value);
    }

    const order = options.orderBy ?? this.defaultOrder;
    query = query.order(order.column, { ascending: order.ascending ?? true });
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw this.fail(error);
    return (data ?? []) as unknown as T[];
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client.from(this.table).select("*").eq("id", id).maybeSingle();
    if (error) throw this.fail(error);
    return (data ?? null) as unknown as T | null;
  }

  async count(filters: Record<string, FilterValue> = {}): Promise<number> {
    let query = this.client.from(this.table).select("*", { count: "exact", head: true });
    for (const [column, value] of Object.entries(filters)) {
      query = query.eq(column, value);
    }
    const { count, error } = await query;
    if (error) throw this.fail(error);
    return count ?? 0;
  }

  async create(input: TCreate): Promise<T> {
    const { data, error } = await this.client
      .from(this.table)
      .insert(input as never)
      .select("*")
      .single();
    if (error) throw this.fail(error);
    return data as unknown as T;
  }

  async insert(input: TCreate): Promise<void> {
    const { error } = await this.client.from(this.table).insert(input as never);
    if (error) throw this.fail(error);
  }

  async update(id: string, input: TUpdate): Promise<T> {
    const { data, error } = await this.client
      .from(this.table)
      .update(input as never)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw this.fail(error);
    return data as unknown as T;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(this.table).delete().eq("id", id);
    if (error) throw this.fail(error);
  }
}

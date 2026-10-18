import type { IReadRepository } from "@/core/domain/contracts";
import { buildLanes } from "@/core/domain/lanes";
import type {
  AdminNote,
  ContactMessage,
  DailyCount,
  DashboardOverview,
  Lane,
  Location,
  LeadStatus,
  QuoteRequest,
  Route,
  Shipment,
  Subscriber,
} from "@/core/domain/models";
import { LEAD_STATUSES } from "@/core/domain/models";

const TIMEZONE = "Asia/Kolkata";
const CHART_DAYS = 14;

export interface DashboardDependencies {
  quotes: IReadRepository<QuoteRequest>;
  messages: IReadRepository<ContactMessage>;
  subscribers: IReadRepository<Subscriber>;
  shipments: IReadRepository<Shipment>;
  notes: IReadRepository<AdminNote>;
  locations: IReadRepository<Location>;
  routes: IReadRepository<Route>;
}

export class DashboardService {
  constructor(private readonly deps: DashboardDependencies) {}

  async getBadgeCounts(): Promise<{ newQuotes: number; newMessages: number }> {
    const [newQuotes, newMessages] = await Promise.all([
      this.deps.quotes.count({ status: "new" }),
      this.deps.messages.count({ status: "new" }),
    ]);
    return { newQuotes, newMessages };
  }

  /** Published cities and the lanes between them, for the network map. */
  async getNetwork(): Promise<{ locations: Location[]; lanes: Lane[] }> {
    const [locations, routes] = await Promise.all([
      this.deps.locations.list({ onlyPublished: true }),
      this.deps.routes.list({ onlyPublished: true }),
    ]);
    return { locations, lanes: buildLanes(routes, locations) };
  }

  async getOverview(): Promise<DashboardOverview> {
    const { quotes, messages, subscribers, shipments, notes } = this.deps;
    const since = new Date(Date.now() - (CHART_DAYS + 1) * 86_400_000).toISOString();

    const [
      totalQuotes,
      newQuotes,
      totalMessages,
      newMessages,
      totalSubscribers,
      totalShipments,
      deliveredShipments,
      statusCounts,
      recentWindow,
      recentQuotes,
      recentMessages,
      pinnedNotes,
    ] = await Promise.all([
      quotes.count(),
      quotes.count({ status: "new" }),
      messages.count(),
      messages.count({ status: "new" }),
      subscribers.count({ is_active: true }),
      shipments.count(),
      shipments.count({ status: "delivered" }),
      Promise.all(LEAD_STATUSES.map((status) => quotes.count({ status }))),
      quotes.list({ createdSince: since, limit: 1000 }),
      quotes.list({ limit: 6 }),
      messages.list({ limit: 6 }),
      notes.list({ filters: { pinned: true }, limit: 6 }),
    ]);

    const quotesByStatus = Object.fromEntries(
      LEAD_STATUSES.map((status, index) => [status, statusCounts[index]]),
    ) as Record<LeadStatus, number>;

    return {
      totals: {
        quotes: totalQuotes,
        newQuotes,
        messages: totalMessages,
        newMessages,
        subscribers: totalSubscribers,
        activeShipments: Math.max(totalShipments - deliveredShipments, 0),
      },
      quotesByStatus,
      quotesPerDay: this.bucketByDay(recentWindow),
      recentQuotes,
      recentMessages,
      pinnedNotes,
    };
  }

  private bucketByDay(rows: QuoteRequest[]): DailyCount[] {
    const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });
    const dayLabel = new Intl.DateTimeFormat("en-IN", { timeZone: TIMEZONE, day: "numeric", month: "short" });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = dayKey.format(new Date(row.created_at));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const series: DailyCount[] = [];
    for (let offset = CHART_DAYS - 1; offset >= 0; offset -= 1) {
      const date = new Date(Date.now() - offset * 86_400_000);
      const key = dayKey.format(date);
      series.push({ date: key, label: dayLabel.format(date), count: counts.get(key) ?? 0 });
    }
    return series;
  }
}

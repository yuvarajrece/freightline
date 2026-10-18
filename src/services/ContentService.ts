import type { IReadRepository, ISettingsRepository } from "@/core/domain/contracts";
import { buildLanes } from "@/core/domain/lanes";
import type {
  Client,
  Faq,
  FleetVehicle,
  HomeContent,
  Location,
  ProcessStep,
  Route,
  Service,
  Stat,
  Testimonial,
} from "@/core/domain/models";

export interface ContentDependencies {
  settings: ISettingsRepository;
  services: IReadRepository<Service>;
  fleet: IReadRepository<FleetVehicle>;
  locations: IReadRepository<Location>;
  routes: IReadRepository<Route>;
  stats: IReadRepository<Stat>;
  steps: IReadRepository<ProcessStep>;
  testimonials: IReadRepository<Testimonial>;
  faqs: IReadRepository<Faq>;
  clients: IReadRepository<Client>;
}

/** Assembles everything the public website needs from the database. */
export class ContentService {
  constructor(private readonly deps: ContentDependencies) {}

  async getSettings() {
    return this.deps.settings.getAll();
  }

  async getHomeContent(): Promise<HomeContent> {
    const published = { onlyPublished: true } as const;
    const d = this.deps;

    const [settings, services, fleet, locations, routes, stats, steps, testimonials, faqs, clients] =
      await Promise.all([
        d.settings.getAll(),
        d.services.list(published),
        d.fleet.list(published),
        d.locations.list(published),
        d.routes.list(published),
        d.stats.list(published),
        d.steps.list(published),
        d.testimonials.list(published),
        d.faqs.list(published),
        d.clients.list(published),
      ]);

    return {
      settings,
      services,
      fleet,
      locations,
      lanes: buildLanes(routes, locations),
      stats,
      steps,
      testimonials,
      faqs,
      clients,
    };
  }
}

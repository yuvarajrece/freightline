import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResourceKey } from "@/core/config/resources";
import type {
  Client,
  Faq,
  FleetVehicle,
  Location,
  ProcessStep,
  Route,
  Service,
  Shipment,
  Stat,
  Testimonial,
} from "@/core/domain/models";
import {
  ContactRepository,
  ContentRepository,
  NoteRepository,
  QuoteRepository,
  SettingsRepository,
  ShipmentEventRepository,
  SubscriberRepository,
  TrackingRepository,
} from "@/infrastructure/repositories/repositories";
import { createPublicSupabaseClient } from "@/infrastructure/supabase/clients";
import { ContentService } from "./ContentService";
import { DashboardService } from "./DashboardService";
import { InboxService } from "./InboxService";
import { LeadService } from "./LeadService";
import { NoteService } from "./NoteService";
import { ResourceService, type ResourceRepository } from "./ResourceService";
import { TrackingService } from "./TrackingService";

/**
 * Composition root. The only place that knows which concrete classes implement which interfaces.
 * Services are created lazily and reused for the lifetime of the container.
 */
export class AppContainer {
  private readonly instances = new Map<string, unknown>();

  constructor(private readonly client: SupabaseClient) {}

  private once<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) this.instances.set(key, factory());
    return this.instances.get(key) as T;
  }

  /* ----------------------------- Repositories ----------------------------- */

  private get settingsRepo() {
    return this.once("settingsRepo", () => new SettingsRepository(this.client));
  }
  private get quotesRepo() {
    return this.once("quotesRepo", () => new QuoteRepository(this.client));
  }
  private get contactsRepo() {
    return this.once("contactsRepo", () => new ContactRepository(this.client));
  }
  private get subscribersRepo() {
    return this.once("subscribersRepo", () => new SubscriberRepository(this.client));
  }
  private get notesRepo() {
    return this.once("notesRepo", () => new NoteRepository(this.client));
  }
  private get eventsRepo() {
    return this.once("eventsRepo", () => new ShipmentEventRepository(this.client));
  }
  private get shipmentsRepo() {
    return this.once("shipmentsRepo", () => new ContentRepository<Shipment>(this.client, "shipments"));
  }

  private content<T extends { id: string }>(table: string): ContentRepository<T> {
    return this.once(`content:${table}`, () => new ContentRepository<T>(this.client, table));
  }

  /* ------------------------------- Services ------------------------------- */

  get contentService(): ContentService {
    return this.once(
      "contentService",
      () =>
        new ContentService({
          settings: this.settingsRepo,
          services: this.content<Service>("services"),
          fleet: this.content<FleetVehicle>("fleet_vehicles"),
          locations: this.content<Location>("locations"),
          routes: this.content<Route>("routes"),
          stats: this.content<Stat>("stats"),
          steps: this.content<ProcessStep>("process_steps"),
          testimonials: this.content<Testimonial>("testimonials"),
          faqs: this.content<Faq>("faqs"),
          clients: this.content<Client>("clients"),
        }),
    );
  }

  get leadService(): LeadService {
    return this.once("leadService", () => new LeadService(this.quotesRepo, this.contactsRepo, this.subscribersRepo));
  }

  get trackingService(): TrackingService {
    return this.once("trackingService", () => new TrackingService(new TrackingRepository(this.client)));
  }

  get noteService(): NoteService {
    return this.once("noteService", () => new NoteService(this.notesRepo));
  }

  get dashboardService(): DashboardService {
    return this.once(
      "dashboardService",
      () =>
        new DashboardService({
          quotes: this.quotesRepo,
          messages: this.contactsRepo,
          subscribers: this.subscribersRepo,
          shipments: this.shipmentsRepo,
          notes: this.notesRepo,
          locations: this.content<Location>("locations"),
          routes: this.content<Route>("routes"),
        }),
    );
  }

  get inboxService(): InboxService {
    return this.once(
      "inboxService",
      () => new InboxService(this.quotesRepo, this.contactsRepo, this.subscribersRepo, this.eventsRepo),
    );
  }

  get settingsService(): SettingsRepository {
    return this.settingsRepo;
  }

  get resourceService(): ResourceService {
    return this.once("resourceService", () => {
      const table = (name: string) => this.content<{ id: string } & Record<string, unknown>>(name) as unknown as ResourceRepository;
      const repositories: Record<ResourceKey, ResourceRepository> = {
        services: table("services"),
        fleet: table("fleet_vehicles"),
        locations: table("locations"),
        routes: table("routes"),
        stats: table("stats"),
        steps: table("process_steps"),
        testimonials: table("testimonials"),
        faqs: table("faqs"),
        clients: table("clients"),
        shipments: this.shipmentsRepo as unknown as ResourceRepository,
      };
      return new ResourceService(repositories);
    });
  }

  /** Exposes lists for CSV export without leaking repositories into pages. */
  get exportSources() {
    return {
      quotes: () => this.quotesRepo.list({ limit: 5000 }),
      messages: () => this.contactsRepo.list({ limit: 5000 }),
      subscribers: () => this.subscribersRepo.list({ limit: 20000 }),
    };
  }
}

/* --------------------------- Public (cached) instance --------------------------- */

let publicContainer: AppContainer | null = null;

/** Container backed by the cookie-less anon client; safe for ISR and visitor submissions. */
export function getPublicContainer(): AppContainer {
  if (!publicContainer) publicContainer = new AppContainer(createPublicSupabaseClient());
  return publicContainer;
}

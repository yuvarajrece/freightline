import type { Metadata } from "next";
import { ClientsStrip } from "@/components/site/ClientsStrip";
import { ContactSection } from "@/components/site/ContactSection";
import { FaqSection } from "@/components/site/FaqSection";
import { FleetSection } from "@/components/site/FleetSection";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { Hero } from "@/components/site/Hero";
import { NetworkSection } from "@/components/site/NetworkSection";
import { ProcessSection } from "@/components/site/ProcessSection";
import { QuoteSection } from "@/components/site/QuoteSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { SetupNotice } from "@/components/site/SetupNotice";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader, type NavItem } from "@/components/site/SiteHeader";
import { StatsSection } from "@/components/site/StatsSection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { loadHomeContent } from "@/lib/content";
import { setting } from "@/lib/settings";

/** Content is cached for a minute and also revalidated instantly when an admin saves a change. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadHomeContent();
  if (result.status !== "ready") return {};

  const { settings } = result.content;
  const title = setting(settings, "seo", "title");
  const description = setting(settings, "seo", "description");

  return {
    title: title ? { absolute: title } : undefined,
    description: description || undefined,
    openGraph: { title: title || undefined, description: description || undefined, type: "website" },
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const result = await loadHomeContent();

  if (result.status === "unconfigured") {
    return (
      <SetupNotice
        title="Connect your Supabase project"
        steps={[
          "Create a free project at supabase.com.",
          "Run supabase/migrations/0001_schema.sql, then supabase/seed.sql in the SQL editor.",
          "Copy .env.example to .env.local and add your project URL and anon key.",
          "Restart the dev server.",
        ]}
      />
    );
  }

  if (result.status === "error") {
    return (
      <SetupNotice
        title="We could not load the site content"
        steps={[
          "Confirm the schema and seed files were run in the Supabase SQL editor.",
          "Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct.",
        ]}
        detail={result.message}
      />
    );
  }

  const { settings, services, fleet, locations, lanes, stats, steps, testimonials, faqs, clients } = result.content;
  const brandName = setting(settings, "brand", "name") || "Freightline";
  const s = (key: string) => setting(settings, "sections", key);

  // Navigation only lists sections that actually have content, so it never links to nothing.
  const navItems: NavItem[] = [
    services.length > 0 ? { href: "#services", label: "Services" } : null,
    lanes.length > 0 ? { href: "#network", label: "Network" } : null,
    fleet.length > 0 ? { href: "#fleet", label: "Fleet" } : null,
    steps.length > 0 ? { href: "#process", label: "How it works" } : null,
    faqs.length > 0 ? { href: "#faq", label: "FAQ" } : null,
    { href: "#contact", label: "Contact" },
  ].filter((item): item is NavItem => item !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brandName,
    description: setting(settings, "seo", "description") || undefined,
    telephone: setting(settings, "brand", "phone") || undefined,
    email: setting(settings, "brand", "email") || undefined,
    address: setting(settings, "brand", "address")
      ? { "@type": "PostalAddress", streetAddress: setting(settings, "brand", "address") }
      : undefined,
    openingHours: setting(settings, "brand", "hours") || undefined,
  };

  return (
    <>
      <SiteHeader
        brandName={brandName}
        phone={setting(settings, "brand", "phone")}
        items={navItems}
        ctaLabel={setting(settings, "hero", "primary_cta") || "Get a quote"}
      />
      <main>
        <Hero settings={settings} locations={locations} lanes={lanes} hasNetwork={lanes.length > 0} />
        <ClientsStrip clients={clients} title={s("clients_title")} />
        <ServicesSection services={services} title={s("services_title")} subtitle={s("services_subtitle")} />
        <StatsSection stats={stats} title={s("stats_title")} />
        <NetworkSection lanes={lanes} locations={locations} title={s("network_title")} subtitle={s("network_subtitle")} />
        <FleetSection fleet={fleet} title={s("fleet_title")} subtitle={s("fleet_subtitle")} />
        <ProcessSection steps={steps} title={s("process_title")} subtitle={s("process_subtitle")} />
        <TestimonialsSection testimonials={testimonials} title={s("testimonials_title")} />
        <FaqSection faqs={faqs} title={s("faq_title")} />
        <QuoteSection settings={settings} services={services} />
        <ContactSection settings={settings} />
      </main>
      <SiteFooter settings={settings} navItems={navItems} />
      <FloatingWhatsApp number={setting(settings, "brand", "whatsapp")} brandName={brandName} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}

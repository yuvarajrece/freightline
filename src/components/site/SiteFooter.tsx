import { Truck } from "lucide-react";
import type { SettingsMap } from "@/core/domain/models";
import { setting } from "@/lib/settings";
import { NewsletterForm } from "./NewsletterForm";
import type { NavItem } from "./SiteHeader";

const SOCIAL: { key: string; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
];

export function SiteFooter({ settings, navItems }: { settings: SettingsMap; navItems: NavItem[] }) {
  const brandName = setting(settings, "brand", "name");
  const tagline = setting(settings, "brand", "tagline");
  const about = setting(settings, "footer", "about");
  const legal = setting(settings, "footer", "legal");
  const gst = setting(settings, "footer", "gst");
  const newsletterTitle = setting(settings, "sections", "newsletter_title");
  const newsletterSubtitle = setting(settings, "sections", "newsletter_subtitle");
  const socials = SOCIAL.map((item) => ({ ...item, href: setting(settings, "social", item.key) })).filter((item) => item.href);

  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="mx-auto max-w-7xl px-5">
        {newsletterTitle ? (
          <div className="flex flex-col gap-6 border-b border-white/10 py-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{newsletterTitle}</h2>
              {newsletterSubtitle ? <p className="mt-2 max-w-lg text-ink-300">{newsletterSubtitle}</p> : null}
            </div>
            <NewsletterForm />
          </div>
        ) : null}

        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5 text-white">
              <span className="grid size-9 place-items-center rounded-lg bg-signal-400 text-ink-950">
                <Truck className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-semibold">{brandName}</span>
            </a>
            {tagline ? <p className="mt-3 text-sm text-ink-300">{tagline}</p> : null}
            {about ? <p className="mt-4 max-w-sm text-sm">{about}</p> : null}
          </div>

          {navItems.length > 0 ? (
            <nav aria-label="Footer">
              <p className="text-sm font-semibold text-white">Explore</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="transition-colors hover:text-signal-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {socials.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-white">Follow</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {socials.map((item) => (
                  <li key={item.key}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-signal-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-ink-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brandName}. {legal}
          </p>
          {gst ? <p>{gst}</p> : null}
        </div>
      </div>
    </footer>
  );
}

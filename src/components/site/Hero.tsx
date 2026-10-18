import { buttonStyles } from "@/components/ui/button";
import { LineReveal } from "@/components/motion/LineReveal";
import type { Lane, Location, SettingsMap } from "@/core/domain/models";
import { setting } from "@/lib/settings";
import { splitLines } from "@/lib/utils";
import { NetworkMap } from "./NetworkMap";
import { TrackingPanel } from "./TrackingPanel";

interface HeroProps {
  settings: SettingsMap;
  locations: Location[];
  lanes: Lane[];
  hasNetwork: boolean;
}

export function Hero({ settings, locations, lanes, hasNetwork }: HeroProps) {
  const headlineLines = splitLines(setting(settings, "hero", "headline"));
  const lines = headlineLines.length > 0 ? headlineLines : [setting(settings, "brand", "name")].filter(Boolean);
  const subheadline = setting(settings, "hero", "subheadline");
  const primary = setting(settings, "hero", "primary_cta");
  const secondary = setting(settings, "hero", "secondary_cta");

  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink-950 text-white">
      <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10 opacity-[0.07]" />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-0 -z-10 size-[620px] rounded-full bg-ink-700/40 blur-[120px]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-28 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-32 lg:pb-28">
        <div className="relative z-10">
          {lines.length > 0 ? (
            <LineReveal
              lines={lines}
              className="font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl"
            />
          ) : null}

          {subheadline ? <p className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl">{subheadline}</p> : null}

          {primary || secondary ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {primary ? (
                <a href="#quote" className={buttonStyles("primary", "lg")}>
                  {primary}
                </a>
              ) : null}
              {secondary && hasNetwork ? (
                <a href="#network" className={buttonStyles("secondary", "lg", "border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40")}>
                  {secondary}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-10 max-w-xl">
            <TrackingPanel
              label={setting(settings, "hero", "tracking_label") || "Track a consignment"}
              placeholder={setting(settings, "hero", "tracking_placeholder") || "Tracking code"}
            />
          </div>
        </div>

        {locations.length > 0 ? (
          <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none lg:justify-self-end">
            <NetworkMap locations={locations} lanes={lanes} className="h-auto w-full lg:max-h-[680px]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Lane, Location } from "@/core/domain/models";
import { INDIA_MAP_IMAGE, laneArc, projectOnImage } from "@/lib/india-map";

interface NetworkOverviewProps {
  locations: Location[];
  lanes: Lane[];
}

interface Vehicle {
  key: string;
  path: string;
  duration: number;
  offset: number;
}

/** Longer lanes get a second vehicle running the opposite way, so the map reads as two-way traffic. */
const LONG_LANE_HOURS = 12;

function buildVehicles(lanes: Lane[]): Vehicle[] {
  const vehicles: Vehicle[] = [];

  lanes.forEach((lane, index) => {
    const forward = laneArc(lane.from, lane.to);
    const back = laneArc(lane.to, lane.from);
    const duration = Math.min(Math.max(lane.transitHours * 0.6, 5), 16);

    vehicles.push({ key: `${lane.id}-out`, path: forward, duration, offset: (index * 1.9) % duration });
    if (lane.transitHours >= LONG_LANE_HOURS) {
      vehicles.push({ key: `${lane.id}-back`, path: back, duration, offset: (index * 1.9 + duration / 2) % duration });
    }
  });

  return vehicles;
}

/**
 * Admin overview map: the supplied India artwork with every published lane drawn on it and
 * vehicles driving along each one. Cities, lanes and transit times all come from the database,
 * so editing them under Website content redraws the map. Animation is SMIL/CSS, no client JavaScript.
 */
export function NetworkOverview({ locations, lanes }: NetworkOverviewProps) {
  const vehicles = buildVehicles(lanes);
  const connected = new Set(lanes.flatMap((lane) => [lane.from.id, lane.to.id]));
  const hubCount = locations.filter((location) => location.is_hub).length;
  const { width, height, src } = INDIA_MAP_IMAGE;

  return (
    <section aria-labelledby="network-map" className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="network-map" className="text-xl font-semibold">
            Network map
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            {locations.length} cities, {hubCount} hubs and {lanes.length} scheduled lanes, as published on the website.
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/admin/content/locations" className="text-ink-700 hover:text-signal-700">
            Edit cities
          </Link>
          <Link href="/admin/content/routes" className="text-ink-700 hover:text-signal-700">
            Edit lanes
          </Link>
        </div>
      </div>

      {lanes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 px-4 py-10 text-center text-ink-600">
          No lanes yet. Add cities and lanes under Website content and they appear here.
        </p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto h-auto w-full max-w-[34rem]"
            role="img"
            aria-label={`Map of India with ${lanes.length} lanes between ${locations.length} cities and vehicles driving along each lane`}
          >
            <image href={src} width={width} height={height} />

            <g fill="none" strokeLinecap="round">
              {lanes.map((lane, index) => {
                const d = laneArc(lane.from, lane.to);
                return (
                  <g key={lane.id}>
                    <title>{`${lane.from.name} to ${lane.to.name}, about ${lane.transitHours} h, ${lane.label}`}</title>
                    <path
                      d={d}
                      pathLength={1}
                      className="route-line"
                      stroke="#e39a00"
                      strokeWidth="1.7"
                      style={{ "--delay": `${(index * 0.12).toFixed(2)}s` } as CSSProperties}
                    />
                    <path d={d} className="route-flow" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                  </g>
                );
              })}
            </g>

            <g>
              {vehicles.map((vehicle) => (
                <g key={vehicle.key} className="map-vehicle">
                  <animateMotion
                    dur={`${vehicle.duration}s`}
                    repeatCount="indefinite"
                    begin={`-${vehicle.offset.toFixed(2)}s`}
                    path={vehicle.path}
                    rotate="auto"
                  />
                  <g transform="scale(1.3)">
                    <circle r="8" fill="#f2a900" opacity="0.28" />
                    <rect x="-9" y="-2.7" width="11.5" height="5.4" rx="1.3" fill="#0b1f3a" stroke="#ffffff" strokeWidth="0.9" />
                    <rect x="3" y="-2.3" width="4.8" height="4.6" rx="1.3" fill="#f2a900" stroke="#ffffff" strokeWidth="0.9" />
                  </g>
                </g>
              ))}
            </g>

            <g>
              {locations.map((location, index) => {
                const { x, y } = projectOnImage(location.latitude, location.longitude);
                const labelOnLeft = location.longitude < 79;
                return (
                  <g key={location.id}>
                    <title>{`${location.name}${location.state ? `, ${location.state}` : ""}`}</title>
                    {location.is_hub ? (
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="none"
                        stroke="#e39a00"
                        strokeWidth="1.2"
                        className="hub-pulse"
                        style={{ "--delay": `${(index * 0.35).toFixed(2)}s` } as CSSProperties}
                      />
                    ) : null}
                    <circle
                      cx={x}
                      cy={y}
                      r={location.is_hub ? 4.6 : 3}
                      fill={location.is_hub ? "#0b1f3a" : connected.has(location.id) ? "#ffffff" : "#9fb4d1"}
                      stroke={location.is_hub ? "#f2a900" : "#0b1f3a"}
                      strokeWidth={location.is_hub ? 1.8 : 1.3}
                    />
                    {location.is_hub ? (
                      <text
                        x={labelOnLeft ? x - 9 : x + 9}
                        y={y + 4}
                        textAnchor={labelOnLeft ? "end" : "start"}
                        fontSize="11.5"
                        fontWeight="700"
                        fill="#0b1f3a"
                        style={{ paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 3, strokeLinejoin: "round" }}
                      >
                        {location.name}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-ink-600 uppercase">Lanes</h3>
            <ul className="mt-3 max-h-[26rem] divide-y divide-ink-100 overflow-y-auto pr-1">
              {lanes.map((lane) => (
                <li key={lane.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate font-medium text-ink-900">
                    {lane.from.name} <span className="text-ink-400">to</span> {lane.to.name}
                  </span>
                  <span className="shrink-0 text-right text-ink-600">
                    <span className="font-medium tabular-nums text-ink-800">{lane.transitHours} h</span>
                    <span className="block text-xs">{lane.label}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-500">
              Vehicles show each lane&apos;s published schedule and transit time. They are not live GPS positions.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

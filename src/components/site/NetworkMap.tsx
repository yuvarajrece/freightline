import type { CSSProperties } from "react";
import type { Lane, Location } from "@/core/domain/models";
import { MAP_HEIGHT, MAP_WIDTH, arcPath, indiaOutlinePath, project } from "@/lib/geo";

interface NetworkMapProps {
  locations: Location[];
  lanes: Lane[];
  className?: string;
}

/**
 * Dot-matrix map of India with animated lanes and moving trucks.
 * Entirely driven by the locations and routes tables; animation is CSS/SMIL so it ships no JavaScript.
 */
export function NetworkMap({ locations, lanes, className }: NetworkMapProps) {
  const outline = indiaOutlinePath();
  const laneLocationIds = new Set(lanes.flatMap((lane) => [lane.from.id, lane.to.id]));

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className={className}
      role="img"
      aria-label={`Network map showing ${locations.length} cities and ${lanes.length} scheduled lanes across India`}
    >
      <defs>
        <clipPath id="india-clip">
          <path d={outline} />
        </clipPath>
        <pattern id="dot-matrix" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.25" fill="#6c88b0" />
        </pattern>
        <radialGradient id="map-glow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#1b3a63" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1b3a63" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-glow)" />
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#dot-matrix)" clipPath="url(#india-clip)" opacity="0.55" />
      <path d={outline} fill="none" stroke="#46658f" strokeWidth="1" strokeLinejoin="round" opacity="0.7" />

      {/* Lanes */}
      <g fill="none" strokeLinecap="round">
        {lanes.map((lane, index) => {
          const d = arcPath(project(lane.from.latitude, lane.from.longitude), project(lane.to.latitude, lane.to.longitude));
          const delay = `${(index * 0.14).toFixed(2)}s`;
          return (
            <g key={lane.id}>
              <path
                d={d}
                pathLength={1}
                className="route-line"
                stroke="#ffc21a"
                strokeWidth="1.5"
                opacity="0.85"
                style={{ "--delay": delay } as CSSProperties}
              />
              <path d={d} className="route-flow" stroke="#fff3c4" strokeWidth="1" opacity="0.55" />
            </g>
          );
        })}
      </g>

      {/* Trucks travelling along each lane */}
      <g>
        {lanes.map((lane, index) => {
          const d = arcPath(project(lane.from.latitude, lane.from.longitude), project(lane.to.latitude, lane.to.longitude));
          const duration = Math.min(Math.max(lane.transitHours * 0.45, 4), 14);
          const reverse = index % 2 === 1;
          return (
            <g key={`truck-${lane.id}`}>
              <circle r="6" fill="#ffc21a" opacity="0.22">
                <animateMotion
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  begin={`-${(index * 1.7) % duration}s`}
                  path={d}
                  {...(reverse ? { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" } : {})}
                />
              </circle>
              <circle r="2.6" fill="#ffffff">
                <animateMotion
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  begin={`-${(index * 1.7) % duration}s`}
                  path={d}
                  {...(reverse ? { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" } : {})}
                />
              </circle>
            </g>
          );
        })}
      </g>

      {/* Cities */}
      <g>
        {locations.map((location, index) => {
          const { x, y } = project(location.latitude, location.longitude);
          const active = laneLocationIds.has(location.id);
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
                  stroke="#ffc21a"
                  strokeWidth="1.2"
                  className="hub-pulse"
                  style={{ "--delay": `${(index * 0.35).toFixed(2)}s` } as CSSProperties}
                />
              ) : null}
              <circle
                cx={x}
                cy={y}
                r={location.is_hub ? 5 : 3.2}
                fill={location.is_hub ? "#ffc21a" : active ? "#c9d6e8" : "#6c88b0"}
                stroke="#07162b"
                strokeWidth="1.5"
              />
              {location.is_hub ? (
                <text
                  x={labelOnLeft ? x - 11 : x + 11}
                  y={y + 4}
                  textAnchor={labelOnLeft ? "end" : "start"}
                  fontSize="12.5"
                  fontWeight="600"
                  fill="#e4ebf5"
                  style={{ paintOrder: "stroke", stroke: "#07162b", strokeWidth: 3, strokeLinejoin: "round" }}
                >
                  {location.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

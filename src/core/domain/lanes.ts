import type { Lane, Location, Route } from "./models";

/** Resolves route rows to lanes, skipping any whose endpoints are unpublished or missing. */
export function buildLanes(routes: Route[], locations: Location[]): Lane[] {
  const byId = new Map(locations.map((location) => [location.id, location]));
  const lanes: Lane[] = [];

  for (const route of routes) {
    const from = byId.get(route.from_location_id);
    const to = byId.get(route.to_location_id);
    if (!from || !to) continue;
    lanes.push({ id: route.id, from, to, transitHours: route.transit_hours, label: route.label });
  }
  return lanes;
}

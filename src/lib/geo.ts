/**
 * Map geometry helpers. Pure functions, no React: easy to unit test and reuse.
 * Equirectangular projection tuned for the Indian subcontinent.
 */

export interface Point {
  x: number;
  y: number;
}

export const MAP_WIDTH = 590;
export const MAP_HEIGHT = 660;

const PADDING = 14;
const MIN_LNG = 68;
const MAX_LAT = 37.5;
const X_PER_DEGREE = 18.6; // longitude degrees shrink with latitude, so x is scaled down vs y
const Y_PER_DEGREE = 20;

export function project(latitude: number, longitude: number): Point {
  return {
    x: PADDING + (longitude - MIN_LNG) * X_PER_DEGREE,
    y: PADDING + (MAX_LAT - latitude) * Y_PER_DEGREE,
  };
}

/** Simplified national outline as [longitude, latitude] pairs, clockwise from Kashmir. */
const INDIA_OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [74.0, 37.0], [77.0, 35.6], [79.0, 34.0], [78.6, 32.5], [79.0, 31.0], [81.0, 30.2],
  [80.0, 28.8], [84.0, 27.4], [88.0, 26.5], [88.2, 27.8], [89.0, 26.8], [92.0, 26.9],
  [94.0, 27.9], [96.5, 28.3], [97.3, 27.5], [95.5, 26.0], [94.5, 24.0], [93.3, 22.5],
  [92.4, 21.5], [92.0, 23.0], [91.2, 23.6], [89.8, 22.2], [88.8, 21.6], [87.0, 21.5],
  [86.8, 20.5], [85.0, 19.5], [83.0, 17.5], [82.0, 16.5], [80.3, 15.6], [80.2, 13.0],
  [79.8, 11.5], [79.3, 10.3], [78.2, 8.8], [77.5, 8.1], [76.5, 9.0], [75.5, 11.5],
  [74.8, 13.0], [73.8, 15.5], [73.0, 17.5], [72.8, 19.5], [72.7, 21.0], [72.2, 21.8],
  [70.5, 20.8], [69.0, 22.3], [68.2, 23.7], [70.0, 24.3], [71.0, 25.5], [70.0, 27.5],
  [71.5, 28.5], [73.3, 29.8], [74.5, 31.3], [74.7, 32.5], [74.0, 34.5],
];

export function indiaOutlinePath(): string {
  return (
    INDIA_OUTLINE.map(([lng, lat], index) => {
      const { x, y } = project(lat, lng);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

/** Quadratic arc between two points, always bowing upward so lanes read as flight-path style arcs. */
export function arcPath(from: Point, to: Point, curvature = 0.2): string {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;

  // Perpendicular to the segment; pick the direction that points up the screen.
  let nx = -dy / distance;
  let ny = dx / distance;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const control = { x: mid.x + nx * distance * curvature, y: mid.y + ny * distance * curvature };
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

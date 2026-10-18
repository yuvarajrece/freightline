import { arcPath, type Point } from "./geo";

/**
 * Projection for the raster India map at /images/india-map.png (518 x 590 px).
 * The artwork uses a Lambert conformal conic projection (standard parallels 12.47 and 35.17,
 * origin 24N 80E). The scale and offsets below were fitted so that Kanyakumari, the Kutch tip and
 * the Arunachal tip land on their pixels; mapped cities fall within a few pixels of the real position.
 */
export const INDIA_MAP_IMAGE = { src: "/images/india-map.png", width: 518, height: 590 } as const;

const STD_PARALLEL_1 = (12.47 * Math.PI) / 180;
const STD_PARALLEL_2 = (35.17 * Math.PI) / 180;
const ORIGIN_LAT = (24 * Math.PI) / 180;
const ORIGIN_LNG = 80;
const SCALE = 1135.98;
const OFFSET_X = 209.71;
const OFFSET_Y = 258.06;

const quarterPi = Math.PI / 4;
const n =
  Math.log(Math.cos(STD_PARALLEL_1) / Math.cos(STD_PARALLEL_2)) /
  Math.log(Math.tan(quarterPi + STD_PARALLEL_2 / 2) / Math.tan(quarterPi + STD_PARALLEL_1 / 2));
const F = (Math.cos(STD_PARALLEL_1) * Math.tan(quarterPi + STD_PARALLEL_1 / 2) ** n) / n;
const rho = (latRad: number) => F / Math.tan(quarterPi + latRad / 2) ** n;

export function projectOnImage(latitude: number, longitude: number): Point {
  const theta = n * (((longitude - ORIGIN_LNG) * Math.PI) / 180);
  const r = rho((latitude * Math.PI) / 180);
  return {
    x: SCALE * (r * Math.sin(theta)) + OFFSET_X,
    y: SCALE * (-(rho(ORIGIN_LAT) - r * Math.cos(theta))) + OFFSET_Y,
  };
}

export function laneArc(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): string {
  return arcPath(projectOnImage(from.latitude, from.longitude), projectOnImage(to.latitude, to.longitude), 0.16);
}

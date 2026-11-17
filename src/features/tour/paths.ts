import network from '../../data/walking.json' with { type: 'json' };

export type WalkingProfile = keyof typeof network.profiles;
type Edge = [number, number];
const paths = network.profiles as unknown as Record<WalkingProfile, Record<string, Edge>>;

export function walkDistance(from: string, to: string, profile: WalkingProfile) {
  if (from === to) return 0;
  return paths[profile][from + '>' + to]?.[0] ?? Infinity;
}

export function walkLine(from: string, to: string, profile: WalkingProfile): [number, number][] {
  const ref = paths[profile][from + '>' + to]?.[1];
  if (!ref) return [];
  const deltas = network.geometry[Math.abs(ref) - 1];
  const points: [number, number][] = [];
  let lat = 0, lon = 0;
  for (let i = 0; i < deltas.length; i += 2) {
    lat += deltas[i]; lon += deltas[i + 1];
    points.push([lat / 1e5, lon / 1e5]);
  }
  return ref < 0 ? points.reverse() : points;
}

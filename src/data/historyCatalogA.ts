import { catalogHistory } from './catalogHistory.ts';
import type { HistorySpot } from './history.ts';
import frames from './historyCatalogA.json' with { type: 'json' };

export const catalogA: HistorySpot[] = Object.entries(frames).map(([placeId, timeline]) =>
  catalogHistory(placeId, timeline),
);

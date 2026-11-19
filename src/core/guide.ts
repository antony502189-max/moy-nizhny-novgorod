import { places } from '../../resident/domain/data.ts';
import { PLACES } from '../data/places.ts';
import { HISTORY } from '../data/history.ts';

export const landmarks = places.map(place => {
  const guest = PLACES.find(p=>p.id===place.id);
  const archive = HISTORY.filter(spot=>spot.placeId===place.id);
  const catalogName = archive.find(spot => spot.id === 'place-' + place.id)?.title;
  return { ...place, name:guest?.name ?? catalogName ?? {ru:place.title}, archive, guest };
});
export const landmark = (id:string) => landmarks.find(p=>p.id===id);

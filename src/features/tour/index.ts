import type { FeatureModule } from '../types';
import { TourPage } from './TourPage';
import { tourStrings } from './strings';
export const tourFeature: FeatureModule = { id: 'tour', path: '/tour', tab: { labelKey: 'tab.tour', icon: 'sparkle' }, Component: TourPage, strings: tourStrings };

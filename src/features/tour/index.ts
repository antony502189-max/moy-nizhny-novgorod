import type { FeatureModule } from '../types';
import { lazy } from 'react';
const TourPage = lazy(() => import('./TourPage').then(m => ({default:m.TourPage})));
import { tourStrings } from './strings';
export const tourFeature: FeatureModule = { id: 'tour', path: '/tour', tab: { labelKey: 'tab.tour', icon: 'route' }, Component: TourPage, strings: tourStrings };

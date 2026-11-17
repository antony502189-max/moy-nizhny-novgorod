import type { FeatureModule } from './types';
import { nowFeature } from './now';
import { historyFeature } from './history';
import { tourFeature } from './tour';
import { reportFeature } from './report';
import { twinFeature } from './twin';
import { dashboardFeature } from './dashboard';

/** Order = tab order. Non-tab modules are still routable (e.g. /dashboard, /twin). */
export const FEATURES: FeatureModule[] = [nowFeature, historyFeature, tourFeature, reportFeature, dashboardFeature, twinFeature];

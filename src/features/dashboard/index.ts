import type { FeatureModule } from '../types';
import { DashboardPage } from './DashboardPage';
import { dashStrings } from './strings';
export const dashboardFeature: FeatureModule = { id: 'dashboard', path: '/dashboard', Component: DashboardPage, strings: dashStrings };

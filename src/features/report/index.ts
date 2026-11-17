import type { FeatureModule } from '../types';
import { ReportPage } from './ReportPage';
import { reportStrings } from './strings';
export const reportFeature: FeatureModule = { id: 'report', path: '/report', tab: { labelKey: 'tab.report', icon: 'flag' }, Component: ReportPage, strings: reportStrings };

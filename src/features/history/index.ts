import type { FeatureModule } from '../types';
import { HistoryPage } from './HistoryPage';
import { historyStrings } from './strings';
export const historyFeature: FeatureModule = { id: 'history', path: '/history', tab: { labelKey: 'tab.history', icon: 'camera' }, Component: HistoryPage, strings: historyStrings };

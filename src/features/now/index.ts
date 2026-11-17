import type { FeatureModule } from '../types';
import { NowPage } from './NowPage';
import { nowStrings } from './strings';
export const nowFeature: FeatureModule = { id: 'now', path: '/now', tab: { labelKey: 'tab.now', icon: 'sunset' }, Component: NowPage, strings: nowStrings };

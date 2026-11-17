import type { FeatureModule } from '../types';
import { TwinPage } from './TwinPage';
import { twinStrings } from './strings';
export const twinFeature: FeatureModule = { id: 'twin', path: '/twin', Component: TwinPage, strings: twinStrings };

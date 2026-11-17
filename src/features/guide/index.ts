import { lazy } from 'react';
import type { FeatureModule } from '../types';
import { guideStrings } from './strings';
export const guideFeature: FeatureModule = {id:'guide',path:'/guide',strings:guideStrings,Component:lazy(()=>import('./GuidePage'))};

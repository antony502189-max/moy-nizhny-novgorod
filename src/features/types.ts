import type { ComponentType } from 'react';
import type { Bundle } from '../core/i18n';

/** A feature module = one hackathon track / product area. Add a new track: create src/features/<id>/, export a FeatureModule, append it in registry.ts. */
export interface FeatureModule {
  id: string;
  /** route prefix, e.g. "/now" (matches "/now" and "/now/...") */
  path: string;
  /** shown in the bottom tab bar when set */
  tab?: { labelKey: string; icon: string };
  Component: ComponentType<{ path: string }>;
  strings: Bundle;
}

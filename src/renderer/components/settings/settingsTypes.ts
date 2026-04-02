/**
 * New top-level settings navigation (5 entries).
 */
export type SettingsTab = 'app' | 'models' | 'cowork' | 'integrations' | 'about';

/**
 * Secondary navigation inside Cowork.
 */
export type CoworkSection = 'engine' | 'memory' | 'persona';

/**
 * Legacy tab IDs from the pre–IA-redesign Settings UI.
 */
export type LegacySettingsTab =
  | 'general'
  | 'coworkAgentEngine'
  | 'model'
  | 'coworkMemory'
  | 'coworkAgent'
  | 'shortcuts'
  | 'im'
  | 'email'
  | 'about';

export type SettingsOpenOptions = {
  /**
   * New tab id or legacy id. Prefer `SettingsTab`; legacy values are mapped.
   */
  initialTab?: SettingsTab | LegacySettingsTab;
  /** When opening directly to a Cowork subsection (also set by legacy tab mapping). */
  initialCoworkSection?: CoworkSection;
  notice?: string;
};

const LEGACY_TAB_MAP: Record<
  LegacySettingsTab,
  { tab: SettingsTab; coworkSection?: CoworkSection }
> = {
  general: { tab: 'app' },
  shortcuts: { tab: 'app' },
  model: { tab: 'models' },
  coworkAgentEngine: { tab: 'cowork', coworkSection: 'engine' },
  coworkMemory: { tab: 'cowork', coworkSection: 'memory' },
  coworkAgent: { tab: 'cowork', coworkSection: 'persona' },
  im: { tab: 'integrations' },
  email: { tab: 'integrations' },
  about: { tab: 'about' },
};

/**
 * Resolve initial route from `SettingsOpenOptions` (new + legacy tab strings).
 */
export function resolveSettingsRoute(options: {
  initialTab?: SettingsTab | LegacySettingsTab | string;
  initialCoworkSection?: CoworkSection;
}): { tab: SettingsTab; coworkSection: CoworkSection } {
  const raw = options.initialTab;
  const fromLegacy =
    raw && raw in LEGACY_TAB_MAP
      ? LEGACY_TAB_MAP[raw as LegacySettingsTab]
      : undefined;

  if (fromLegacy) {
    return {
      tab: fromLegacy.tab,
      coworkSection:
        options.initialCoworkSection ?? fromLegacy.coworkSection ?? 'engine',
    };
  }

  const newTabs: SettingsTab[] = ['app', 'models', 'cowork', 'integrations', 'about'];
  const tab = (raw && newTabs.includes(raw as SettingsTab)
    ? raw
    : 'app') as SettingsTab;

  return {
    tab,
    coworkSection: options.initialCoworkSection ?? 'engine',
  };
}

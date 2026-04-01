/** Shared “premium” card chrome for Skills / MCP lists — accent from stable id hash */

export function hashStringToIndex(id: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

export const RESOURCE_CARD_ACCENTS = [
  {
    bar: 'from-violet-500 via-fuchsia-400 to-cyan-400/80',
    iconWrap:
      'bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 dark:from-violet-400/20 dark:to-fuchsia-500/15 ring-violet-500/20 dark:ring-violet-400/25',
    icon: 'text-violet-600 dark:text-violet-300',
  },
  {
    bar: 'from-sky-500 via-cyan-400 to-emerald-400/80',
    iconWrap:
      'bg-gradient-to-br from-sky-500/15 to-cyan-500/10 dark:from-sky-400/20 dark:to-cyan-500/15 ring-sky-500/20 dark:ring-sky-400/25',
    icon: 'text-sky-600 dark:text-sky-300',
  },
  {
    bar: 'from-amber-500 via-orange-400 to-rose-400/80',
    iconWrap:
      'bg-gradient-to-br from-amber-500/15 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-500/15 ring-amber-500/20 dark:ring-amber-400/25',
    icon: 'text-amber-700 dark:text-amber-300',
  },
  {
    bar: 'from-emerald-500 via-teal-400 to-cyan-400/80',
    iconWrap:
      'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-500/15 ring-emerald-500/20 dark:ring-emerald-400/25',
    icon: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    bar: 'from-indigo-500 via-violet-400 to-purple-400/80',
    iconWrap:
      'bg-gradient-to-br from-indigo-500/15 to-violet-500/10 dark:from-indigo-400/20 dark:to-violet-500/15 ring-indigo-500/20 dark:ring-indigo-400/25',
    icon: 'text-indigo-600 dark:text-indigo-300',
  },
  {
    bar: 'from-rose-500 via-pink-400 to-orange-300/80',
    iconWrap:
      'bg-gradient-to-br from-rose-500/15 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-500/15 ring-rose-500/20 dark:ring-rose-400/25',
    icon: 'text-rose-600 dark:text-rose-300',
  },
] as const;

export type ResourceCardAccent = (typeof RESOURCE_CARD_ACCENTS)[number];

export function getResourceCardAccent(id: string): ResourceCardAccent {
  return RESOURCE_CARD_ACCENTS[hashStringToIndex(id, RESOURCE_CARD_ACCENTS.length)];
}

/** Full card container — interactive (whole card is a control, e.g. skills) */
export const RESOURCE_CARD_SHELL_INTERACTIVE =
  'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out ' +
  'border-black/[0.06] dark:border-white/[0.09] ' +
  'bg-gradient-to-b from-claude-surface via-claude-surface/95 to-claude-bg/30 ' +
  'dark:from-claude-darkSurface/95 dark:via-claude-darkSurface/90 dark:to-claude-darkBg/40 ' +
  'shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] ' +
  'hover:border-claude-accent/35 hover:shadow-[0_12px_40px_-12px_rgba(217,119,87,0.18)] dark:hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.65)] ' +
  'hover:-translate-y-0.5 cursor-pointer';

/** Same look; actions are on inner controls only (e.g. MCP) */
export const RESOURCE_CARD_SHELL_STATIC =
  'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out ' +
  'border-black/[0.06] dark:border-white/[0.09] ' +
  'bg-gradient-to-b from-claude-surface via-claude-surface/95 to-claude-bg/30 ' +
  'dark:from-claude-darkSurface/95 dark:via-claude-darkSurface/90 dark:to-claude-darkBg/40 ' +
  'shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] ' +
  'hover:border-claude-accent/35 hover:shadow-[0_12px_40px_-12px_rgba(217,119,87,0.18)] dark:hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.65)] ' +
  'hover:-translate-y-0.5';

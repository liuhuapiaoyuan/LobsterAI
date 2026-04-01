import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared Claude-themed surfaces for cowork toolbars, dropdowns, and popovers.
 * Z-index: use z-50 for anchored panels; raise only if Electron stacking requires it.
 */
export const CLAUDE_POPOVER_Z = 'z-50';

export const claudePopoverPanelVariants = cva(
  [
    'overflow-hidden rounded-xl border shadow-popover',
    'border-claude-border bg-claude-surface',
    'dark:border-claude-darkBorder dark:bg-claude-darkSurface',
    CLAUDE_POPOVER_Z,
  ].join(' '),
  {
    variants: {
      width: {
        sm: 'w-56',
        md: 'w-60',
        lg: 'w-72',
      },
    },
    defaultVariants: {
      width: 'md',
    },
  },
);

export type ClaudePopoverPanelVariants = VariantProps<typeof claudePopoverPanelVariants>;

export const claudeMenuGroupHeaderClass =
  'px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-claude-textSecondary dark:text-claude-darkTextSecondary';

export const claudeMenuDividerClass =
  'my-1 border-t border-claude-border dark:border-claude-darkBorder';

/** Single-line selectable row (model list). Use `active` from Headless UI Menu.Item. */
export const claudeMenuItemRowVariants = cva(
  [
    'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors',
    'text-claude-text dark:text-claude-darkText',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/30 focus-visible:ring-offset-0',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'bg-claude-surfaceHover dark:bg-claude-darkSurfaceHover',
        false: 'hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

/** Prompt toolbar: folder control (icon + truncated path). */
export const claudePromptToolbarFolderButtonVariants = cva(
  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
  {
    variants: {
      embed: {
        glass:
          'text-claude-textSecondary hover:bg-claude-surfaceHover hover:text-claude-text',
        default:
          'text-claude-textSecondary hover:bg-claude-surfaceHover hover:text-claude-text dark:text-claude-darkTextSecondary dark:hover:bg-claude-darkSurfaceHover dark:hover:text-claude-darkText',
      },
    },
    defaultVariants: {
      embed: 'default',
    },
  },
);

/** Prompt toolbar: icon-only control (attach, etc.). */
export const claudePromptToolbarIconButtonVariants = cva(
  'flex flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-sm transition-colors',
  {
    variants: {
      embed: {
        glass:
          'text-claude-textSecondary hover:bg-claude-surfaceHover hover:text-claude-text',
        default:
          'text-claude-textSecondary hover:bg-claude-surfaceHover hover:text-claude-text dark:text-claude-darkTextSecondary dark:hover:bg-claude-darkSurfaceHover dark:hover:text-claude-darkText',
      },
    },
    defaultVariants: {
      embed: 'default',
    },
  },
);

/** Model selector trigger (matches prior rounded-xl hover). */
export const claudeModelMenuButtonVariants = cva(
  [
    'flex cursor-pointer items-center space-x-2 rounded-xl px-3 py-1.5 transition-colors',
    'text-claude-text hover:bg-claude-surfaceHover dark:text-claude-darkText dark:hover:bg-claude-darkSurfaceHover',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/35',
  ].join(' '),
  {
    variants: {
      open: {
        true: 'bg-claude-surfaceHover dark:bg-claude-darkSurfaceHover',
        false: '',
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

/** Skills popover search field focus ring (aligned with menu items). */
export const claudePopoverSearchInputClass =
  [
    'w-full rounded-lg border border-claude-border bg-claude-surface py-2 pl-9 pr-3 text-sm',
    'text-claude-text placeholder:text-claude-textSecondary',
    'dark:border-claude-darkBorder dark:bg-claude-darkSurface dark:text-claude-darkText dark:placeholder:text-claude-darkTextSecondary',
    'focus:outline-none focus:ring-2 focus:ring-claude-accent/35',
  ].join(' ');

/** Folder popover primary rows (add / recent). */
export const claudeFolderPopoverRowClass =
  [
    'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
    'text-claude-text dark:text-claude-darkText',
    'hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-claude-accent/30',
  ].join(' ');

/** Recent-folder submenu list row. */
export const claudeFolderSubmenuRowClass =
  [
    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
    'text-claude-text dark:text-claude-darkText',
    'hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-claude-accent/30',
  ].join(' ');

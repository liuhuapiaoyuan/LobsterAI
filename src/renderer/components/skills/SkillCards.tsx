import React from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import TrashIcon from '../icons/TrashIcon';
import PuzzleIcon from '../icons/PuzzleIcon';
import { cn } from '@/lib/utils';
import { Skill, MarketplaceSkill } from '../../types/skill';
import { i18nService } from '../../services/i18n';
import {
  getResourceCardAccent,
  RESOURCE_CARD_SHELL_INTERACTIVE,
} from '../ui/resource-card-styles';

export interface InstalledSkillCardProps {
  skill: Skill;
  description: string;
  formattedDate: string;
  showUpgrade: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onUpgrade: () => void;
  disableUpgrade: boolean;
}

export const InstalledSkillCard: React.FC<InstalledSkillCardProps> = ({
  skill,
  description,
  formattedDate,
  showUpgrade,
  onOpen,
  onDelete,
  onToggle,
  onUpgrade,
  disableUpgrade,
}) => {
  const accent = getResourceCardAccent(skill.id);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={RESOURCE_CARD_SHELL_INTERACTIVE}
    >
      <div
        className={cn(
          'h-1 w-full bg-gradient-to-r opacity-90',
          accent.bar,
        )}
        aria-hidden
      />

      <div className="relative p-4 pt-3.5 flex flex-col flex-1 min-h-[168px]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.12] dark:opacity-[0.18] blur-3xl bg-gradient-to-br from-claude-accent to-transparent"
          aria-hidden
        />

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-inner',
              accent.iconWrap,
            )}
          >
            <PuzzleIcon className={cn('h-6 w-6', accent.icon)} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-claude-text dark:text-claude-darkText line-clamp-2">
                {skill.name}
              </h3>
              <div className="flex shrink-0 items-center gap-1.5">
                {!skill.isBuiltIn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="rounded-xl p-2 text-claude-textSecondary dark:text-claude-darkTextSecondary transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                    title={i18nService.t('deleteSkill')}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={skill.enabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-claude-surface dark:focus-visible:ring-offset-claude-darkSurface',
                    skill.enabled
                      ? 'bg-gradient-to-r from-claude-accent to-orange-500 shadow-[0_2px_8px_-2px_rgba(217,119,87,0.5)]'
                      : 'bg-claude-border dark:bg-claude-darkBorder',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200',
                      skill.enabled ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>

            <p className="mt-2.5 text-[13px] leading-relaxed text-claude-textSecondary dark:text-claude-darkTextSecondary line-clamp-3">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-claude-textSecondary dark:text-claude-darkTextSecondary">
            {skill.isOfficial && (
              <span className="inline-flex items-center rounded-full bg-claude-accent/12 px-2 py-0.5 text-claude-accent ring-1 ring-claude-accent/20">
                {i18nService.t('official')}
              </span>
            )}
            {skill.version && (
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06] tabular-nums">
                v{skill.version}
              </span>
            )}
            <span className="tabular-nums opacity-80">{formattedDate}</span>
          </div>

          {showUpgrade && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpgrade();
              }}
              disabled={disableUpgrade}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/[0.12] px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              {i18nService.t('skillUpgrade')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export interface MarketplaceSkillCardProps {
  skill: MarketplaceSkill;
  description: string;
  installStatus: 'not_installed' | 'installed' | 'update_available';
  onOpen: () => void;
  onInstall: () => void;
  onUpgrade: () => void;
  installingSkillId: string | null;
  disableUpgrade: boolean;
  versionLine: React.ReactNode;
}

export const MarketplaceSkillCard: React.FC<MarketplaceSkillCardProps> = ({
  skill,
  description,
  installStatus,
  onOpen,
  onInstall,
  onUpgrade,
  installingSkillId,
  disableUpgrade,
  versionLine,
}) => {
  const accent = getResourceCardAccent(skill.id);
  const isInstalling = installingSkillId === skill.id;

  const action = (() => {
    if (installStatus === 'update_available') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade();
          }}
          disabled={disableUpgrade}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-500/25 dark:text-amber-200 dark:hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          {i18nService.t('skillUpgrade')}
        </button>
      );
    }
    if (installStatus === 'installed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircleIcon className="h-4 w-4" />
          {i18nService.t('skillAlreadyInstalled')}
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInstall();
        }}
        disabled={installingSkillId !== null}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-claude-accent to-orange-500 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-claude-accent/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
        {isInstalling ? i18nService.t('skillInstalling') : i18nService.t('skillInstall')}
      </button>
    );
  })();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={RESOURCE_CARD_SHELL_INTERACTIVE}
    >
      <div
        className={cn('h-1 w-full bg-gradient-to-r opacity-90', accent.bar)}
        aria-hidden
      />

      <div className="relative p-4 pt-3.5 flex flex-col flex-1 min-h-[188px]">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.1] dark:opacity-[0.15] blur-3xl bg-gradient-to-br from-claude-accent to-transparent"
          aria-hidden
        />

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-inner',
              accent.iconWrap,
            )}
          >
            <PuzzleIcon className={cn('h-6 w-6', accent.icon)} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-claude-text dark:text-claude-darkText line-clamp-2 pr-1">
                {skill.name}
              </h3>
              <div className="shrink-0 max-w-[48%] flex justify-end">{action}</div>
            </div>

            <p className="mt-2.5 text-[13px] leading-relaxed text-claude-textSecondary dark:text-claude-darkTextSecondary line-clamp-3">
              {description}
            </p>

            {skill.tags && skill.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skill.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-black/[0.06] bg-black/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-claude-textSecondary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-claude-darkTextSecondary"
                  >
                    {tag}
                  </span>
                ))}
                {skill.tags.length > 4 && (
                  <span className="text-[10px] text-claude-textSecondary/80 dark:text-claude-darkTextSecondary/80">
                    +{skill.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px] font-medium text-claude-textSecondary dark:text-claude-darkTextSecondary">
          {skill.source?.from && (
            <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
              {skill.source.from}
            </span>
          )}
          {versionLine}
        </div>
      </div>
    </article>
  );
}

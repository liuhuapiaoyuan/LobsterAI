import React from 'react';
import ConnectorIcon from '../icons/ConnectorIcon';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import Tooltip from '../ui/Tooltip';
import { cn } from '@/lib/utils';
import {
  getResourceCardAccent,
  RESOURCE_CARD_SHELL_STATIC,
} from '../ui/resource-card-styles';
import { i18nService } from '../../services/i18n';
import { McpRegistryEntry, McpServerConfig, McpTransportType } from '../../types/mcp';

export const MCP_TRANSPORT_BADGE: Record<string, string> = {
  stdio: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  sse: 'bg-green-500/10 text-green-600 dark:text-green-400',
  http: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

function transportBadgeClass(t: McpTransportType | string): string {
  return MCP_TRANSPORT_BADGE[t] || 'bg-claude-surfaceHover dark:bg-claude-darkSurfaceHover text-claude-textSecondary dark:text-claude-darkTextSecondary';
}

export interface McpServerInstanceCardProps {
  server: McpServerConfig;
  description: string;
  tooltipContent: string;
  /** Content after transport badge (command, URL, env hints, etc.) */
  footerDetail: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

/** Installed + custom server rows — same chrome as skill cards; actions only on controls */
export const McpServerInstanceCard: React.FC<McpServerInstanceCardProps> = ({
  server,
  description,
  tooltipContent,
  footerDetail,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const accent = getResourceCardAccent(server.id);

  return (
    <article className={RESOURCE_CARD_SHELL_STATIC}>
      <div className={cn('h-1 w-full bg-gradient-to-r opacity-90', accent.bar)} aria-hidden />

      <div className="relative flex min-h-[168px] flex-1 flex-col p-4 pt-3.5">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-claude-accent to-transparent opacity-[0.12] blur-3xl dark:opacity-[0.18]"
          aria-hidden
        />

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-inner',
              accent.iconWrap,
            )}
          >
            <ConnectorIcon className={cn('h-6 w-6', accent.icon)} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-claude-text dark:text-claude-darkText">
                {server.name}
              </h3>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-xl p-2 text-claude-textSecondary transition-colors hover:bg-claude-accent/10 hover:text-claude-accent dark:text-claude-darkTextSecondary dark:hover:text-claude-accent"
                  title={i18nService.t('editMcpServer')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl p-2 text-claude-textSecondary transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-claude-darkTextSecondary dark:hover:text-red-400"
                  title={i18nService.t('deleteMcpServer')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={server.enabled}
                  onClick={onToggle}
                  className={cn(
                    'relative ml-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-claude-surface dark:focus-visible:ring-offset-claude-darkSurface',
                    server.enabled
                      ? 'bg-gradient-to-r from-claude-accent to-orange-500 shadow-[0_2px_8px_-2px_rgba(217,119,87,0.5)]'
                      : 'bg-claude-border dark:bg-claude-darkBorder',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200',
                      server.enabled ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>

            <Tooltip content={tooltipContent} position="bottom" maxWidth="360px" className="mt-2.5 block w-full">
              <p className="line-clamp-3 text-[13px] leading-relaxed text-claude-textSecondary dark:text-claude-darkTextSecondary">
                {description}
              </p>
            </Tooltip>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] pt-4 text-[11px] font-medium dark:border-white/[0.06]">
          <span className={cn('rounded-md px-2 py-0.5 font-semibold', transportBadgeClass(server.transportType))}>
            {server.transportType}
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-claude-textSecondary dark:text-claude-darkTextSecondary">
            {footerDetail}
          </div>
        </div>
      </div>
    </article>
  );
};

export interface McpMarketplaceEntryCardProps {
  entry: McpRegistryEntry;
  description: string;
  isInstalled: boolean;
  categoryLabel?: string;
  footerDetail: React.ReactNode;
  onInstall: () => void;
}

export const McpMarketplaceEntryCard: React.FC<McpMarketplaceEntryCardProps> = ({
  entry,
  description,
  isInstalled,
  categoryLabel,
  footerDetail,
  onInstall,
}) => {
  const accent = getResourceCardAccent(entry.id);

  return (
    <article className={RESOURCE_CARD_SHELL_STATIC}>
      <div className={cn('h-1 w-full bg-gradient-to-r opacity-90', accent.bar)} aria-hidden />

      <div className="relative flex min-h-[180px] flex-1 flex-col p-4 pt-3.5">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-claude-accent to-transparent opacity-[0.1] blur-3xl dark:opacity-[0.15]"
          aria-hidden
        />

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-inner',
              accent.iconWrap,
            )}
          >
            <ConnectorIcon className={cn('h-6 w-6', accent.icon)} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 pr-1 text-[15px] font-semibold leading-snug tracking-tight text-claude-text dark:text-claude-darkText">
                {entry.name}
              </h3>
              <div className="flex max-w-[48%] shrink-0 justify-end">
                {isInstalled ? (
                  <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-black/[0.04] px-3 py-1.5 text-[11px] font-semibold text-claude-textSecondary dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-claude-darkTextSecondary">
                    {i18nService.t('mcpInstalled')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onInstall}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-claude-accent to-orange-500 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-claude-accent/25 transition hover:brightness-105"
                  >
                    {i18nService.t('mcpInstall')}
                  </button>
                )}
              </div>
            </div>

            <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-claude-textSecondary dark:text-claude-darkTextSecondary">
              {description}
            </p>

            {categoryLabel && (
              <div className="mt-3">
                <span className="inline-flex rounded-md border border-black/[0.06] bg-black/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-claude-textSecondary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-claude-darkTextSecondary">
                  {categoryLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] pt-4 text-[11px] font-medium dark:border-white/[0.06]">
          <span className={cn('rounded-md px-2 py-0.5 font-semibold', transportBadgeClass(entry.transportType))}>
            {entry.transportType}
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-claude-textSecondary dark:text-claude-darkTextSecondary">
            {footerDetail}
          </div>
        </div>
      </div>
    </article>
  );
};

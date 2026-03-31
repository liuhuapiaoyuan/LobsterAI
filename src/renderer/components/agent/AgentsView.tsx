import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { agentService } from '../../services/agent';
import { coworkService } from '../../services/cowork';
import { i18nService } from '../../services/i18n';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { PresetAgent } from '../../types/agent';
import AgentCreateModal from './AgentCreateModal';
import AgentSettingsPanel from './AgentSettingsPanel';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';
import ComposeIcon from '../icons/ComposeIcon';
import WindowTitleBar from '../window/WindowTitleBar';

interface AgentsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onShowCowork?: () => void;
  updateBadge?: React.ReactNode;
}

const AgentsView: React.FC<AgentsViewProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  onShowCowork,
  updateBadge,
}) => {
  const isMac = window.electron.platform === 'darwin';
  const agents = useSelector((state: RootState) => state.agent.agents);
  const currentAgentId = useSelector((state: RootState) => state.agent.currentAgentId);
  const [presets, setPresets] = useState<PresetAgent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);
  const [addingPreset, setAddingPreset] = useState<string | null>(null);

  useEffect(() => {
    agentService.loadAgents();
    agentService.getPresets().then(setPresets);
  }, []);

  // Refresh presets when agents change (to update installed status)
  useEffect(() => {
    agentService.getPresets().then(setPresets);
  }, [agents]);

  const enabledAgents = agents.filter((a) => a.enabled && a.id !== 'main');
  const presetAgents = enabledAgents.filter((a) => a.source === 'preset');
  const customAgents = enabledAgents.filter((a) => a.source === 'custom');
  const uninstalledPresets = presets.filter((p) => !p.installed);

  const handleAddPreset = async (presetId: string) => {
    setAddingPreset(presetId);
    try {
      await agentService.addPreset(presetId);
    } finally {
      setAddingPreset(null);
    }
  };

  const handleSwitchAgent = (agentId: string) => {
    agentService.switchAgent(agentId);
    coworkService.loadSessions(agentId);
    onShowCowork?.();
  };

  return (
    <div className="flex-1 flex flex-col dark:bg-claude-darkBg bg-claude-bg h-full">
      {/* Header */}
      <div className="draggable flex h-12 items-center justify-between px-4 border-b dark:border-claude-darkBorder border-claude-border shrink-0">
        <div className="flex items-center space-x-3 h-8">
          {isSidebarCollapsed && (
            <div className={`non-draggable flex items-center gap-1 ${isMac ? 'pl-[68px]' : ''}`}>
              <button
                type="button"
                onClick={onToggleSidebar}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
              >
                <SidebarToggleIcon className="h-4 w-4" isCollapsed={true} />
              </button>
              <button
                type="button"
                onClick={onNewChat}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
              >
                <ComposeIcon className="h-4 w-4" />
              </button>
              {updateBadge}
            </div>
          )}
          <h1 className="text-lg font-semibold dark:text-claude-darkText text-claude-text">
            {i18nService.t('myAgents')}
          </h1>
        </div>
        <WindowTitleBar inline />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable]">
        <div className="px-4 py-6">
          {/* Subtitle */}
          <p className="text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary mb-6">
            {i18nService.t('agentsSubtitle')}
          </p>

          {/* Preset Agents Section */}
          {(presetAgents.length > 0 || uninstalledPresets.length > 0) && (
            <div className="mb-8">
              <h2 className="text-sm font-medium dark:text-claude-darkTextSecondary text-claude-textSecondary mb-3">
                {i18nService.t('presetAgents')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
                {/* Installed presets */}
                {presetAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    icon={agent.icon}
                    name={agent.name}
                    description={agent.description}
                    isActive={agent.id === currentAgentId}
                    onClick={() => setSettingsAgentId(agent.id)}
                  />
                ))}
                {/* Uninstalled presets */}
                {uninstalledPresets.map((preset) => (
                  <UninstalledPresetCard
                    key={preset.id}
                    icon={preset.icon}
                    name={preset.name}
                    description={preset.description}
                    isAdding={addingPreset === preset.id}
                    onAdd={() => handleAddPreset(preset.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Agents Section */}
          <div>
            <h2 className="text-sm font-medium dark:text-claude-darkTextSecondary text-claude-textSecondary mb-3">
              {i18nService.t('myCustomAgents')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
              {customAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  icon={agent.icon}
                  name={agent.name}
                  description={agent.description}
                  isActive={agent.id === currentAgentId}
                  onClick={() => setSettingsAgentId(agent.id)}
                />
              ))}
              {/* Create new agent card */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="group relative flex min-h-[168px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-claude-border bg-claude-surface/40 transition-all hover:border-claude-accent/70 hover:bg-gradient-to-br hover:from-claude-accent/[0.06] hover:to-transparent dark:border-claude-darkBorder dark:bg-claude-darkSurface/40 dark:hover:border-claude-accent/50"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 [background:radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(243,146,0,0.12),transparent_70%)] dark:[background:radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(243,146,0,0.18),transparent_70%)]" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-claude-accent/20 to-claude-accent/5 shadow-inner ring-1 ring-claude-accent/20 transition-transform group-hover:scale-105 dark:from-claude-accent/30 dark:to-claude-accent/10">
                  <PlusIcon className="h-7 w-7 text-claude-accent" />
                </div>
                <span className="relative text-sm font-semibold text-claude-accent">
                  {i18nService.t('createNewAgent')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgentCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <AgentSettingsPanel
        agentId={settingsAgentId}
        onClose={() => setSettingsAgentId(null)}
        onSwitchAgent={(id) => {
          setSettingsAgentId(null);
          handleSwitchAgent(id);
        }}
      />
    </div>
  );
};

/* ── Agent Card (installed) ─────────────────────────── */

const AgentCard: React.FC<{
  icon: string;
  name: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, name, description, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group cursor-pointer relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border text-left shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/50 ${
      isActive
        ? 'border-claude-accent/50 bg-gradient-to-b from-claude-accent/[0.09] via-claude-surface to-claude-surface ring-1 ring-claude-accent/25 dark:from-claude-accent/20 dark:via-claude-darkSurface dark:to-claude-darkSurface dark:ring-claude-accent/35'
        : 'border-claude-border bg-claude-surface hover:border-claude-accent/35 dark:border-claude-darkBorder dark:bg-claude-darkSurface dark:hover:border-claude-accent/25'
    }`}
  >
    <div
      className={`h-1 w-full shrink-0 ${
        isActive
          ? 'bg-gradient-to-r from-claude-accent via-claude-accentHover to-transparent'
          : 'bg-gradient-to-r from-claude-border via-claude-border/40 to-transparent dark:from-claude-darkBorder dark:via-claude-darkBorder/50'
      }`}
    />
    <div className="flex flex-1 flex-col p-4 pt-3">
      <div className="flex gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner transition-transform group-hover:scale-[1.03] ${
            isActive
              ? 'bg-gradient-to-br from-claude-accent/30 to-claude-accent/5 ring-1 ring-claude-accent/25 dark:from-claude-accent/35 dark:to-claude-accent/10'
              : 'bg-claude-surfaceMuted ring-1 ring-claude-border/60 dark:bg-claude-darkSurfaceInset dark:ring-claude-darkBorder'
          }`}
        >
          {icon || '🤖'}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold leading-snug text-claude-text dark:text-claude-darkText line-clamp-2">
              {name}
            </span>
            {isActive && (
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-claude-accent shadow-glow-accent"
                aria-hidden
              />
            )}
          </div>
          {description && (
            <p className="mt-2 text-xs leading-relaxed text-claude-textSecondary dark:text-claude-darkTextSecondary line-clamp-3">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  </button>
);

/* ── Uninstalled Preset Card ─────────────────────────── */

const UninstalledPresetCard: React.FC<{
  icon: string;
  name: string;
  description: string;
  isAdding: boolean;
  onAdd: () => void;
}> = ({ icon, name, description, isAdding, onAdd }) => (
  <div className="relative flex  min-h-[168px] flex-col overflow-hidden rounded-2xl  cursor-pointer border-transparent border hover:border-claude bg-claude-surface/50 transition-all hover:border-claude-accent/40 hover:bg-claude-surface dark:border-claude-darkBorder dark:bg-claude-darkSurface/50 dark:hover:border-claude-accent/35">
    <div className="h-1 w-full shrink-0 bg-gradient-to-r from-claude-textSecondary/25 via-transparent to-transparent dark:from-claude-darkTextSecondary/30" />
    <div className="flex flex-1 flex-col p-4 pt-3">
      <div className="flex gap-3 opacity-75">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-claude-surfaceMuted text-2xl grayscale ring-1 ring-claude-border/70 dark:bg-claude-darkSurfaceInset dark:ring-claude-darkBorder">
          {icon || '🤖'}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-sm font-semibold leading-snug text-claude-text line-clamp-2 dark:text-claude-darkText">
            {name}
          </div>
          {description && (
            <p className="mt-2 text-xs leading-relaxed text-claude-textSecondary line-clamp-3 dark:text-claude-darkTextSecondary">
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={isAdding}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-claude-accent to-claude-accentHover py-2.5 text-xs font-semibold text-white shadow-subtle transition hover:from-claude-accentHover hover:to-claude-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding ? '...' : (i18nService.t('addAgent') || 'Add')}
      </button>
    </div>
  </div>
);

export default AgentsView;

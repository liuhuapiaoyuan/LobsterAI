import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { agentService } from '../../services/agent';
import { coworkService } from '../../services/cowork';
import { i18nService } from '../../services/i18n';
import type { PresetAgent } from '../../types/agent';
import AgentSettingsPanel from './AgentSettingsPanel';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';
import ComposeIcon from '../icons/ComposeIcon';
import WindowTitleBar from '../window/WindowTitleBar';
import { UninstalledPresetCard } from './AgentsView';

interface LobsterPondViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onShowCowork?: () => void;
  onShowAgents?: () => void;
  updateBadge?: React.ReactNode;
}

const LobsterPondView: React.FC<LobsterPondViewProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  onShowCowork,
  onShowAgents,
  updateBadge,
}) => {
  const isMac = window.electron.platform === 'darwin';
  const agents = useSelector((state: RootState) => state.agent.agents);
  const currentAgentId = useSelector((state: RootState) => state.agent.currentAgentId);
  const [catalog, setCatalog] = useState<PresetAgent[]>([]);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);
  const [addingPreset, setAddingPreset] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await agentService.loadAgents();
      setCatalog(await agentService.getPresetsCatalog());
    })();
  }, []);

  useEffect(() => {
    agentService.getPresetsCatalog().then(setCatalog);
  }, [agents]);

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
            {i18nService.t('lobsterPond')}
          </h1>
        </div>
        <WindowTitleBar inline />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable]">
        <div className="px-4 py-6">
          <p className="text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary mb-6">
            {i18nService.t('lobsterPondSubtitle')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
            {catalog.map((preset) =>
              preset.installed ? (
                <PondInstalledPresetCard
                  key={preset.id}
                  icon={preset.icon}
                  name={preset.name}
                  description={preset.description}
                  isActive={preset.id === currentAgentId}
                  onChat={() => handleSwitchAgent(preset.id)}
                  onSettings={() => setSettingsAgentId(preset.id)}
                />
              ) : (
                <UninstalledPresetCard
                  key={preset.id}
                  icon={preset.icon}
                  name={preset.name}
                  description={preset.description}
                  isAdding={addingPreset === preset.id}
                  onAdd={() => handleAddPreset(preset.id)}
                />
              )
            )}
          </div>

          {onShowAgents && (
            <div className="mt-8 pt-4 border-t border-claude-border/80 dark:border-claude-darkBorder/80">
              <button
                type="button"
                onClick={onShowAgents}
                className="text-sm font-medium text-claude-accent hover:underline"
              >
                {i18nService.t('manageMyAgentsLink')}
              </button>
            </div>
          )}
        </div>
      </div>

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

const PondInstalledPresetCard: React.FC<{
  icon: string;
  name: string;
  description: string;
  isActive: boolean;
  onChat: () => void;
  onSettings: () => void;
}> = ({ icon, name, description, isActive, onChat, onSettings }) => (
  <div
    className={`group relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl border text-left shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated ${
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
    <div className="flex  flex-1 flex-col p-4 pt-3">
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
      <div className="mt-auto pt-4 flex  gap-1">
        <button
          type="button"
          onClick={onChat}
          className="w-full rounded-xl bg-gradient-to-r from-claude-accent to-claude-accentHover py-2.5 text-xs font-semibold text-white shadow-subtle transition hover:from-claude-accentHover hover:to-claude-accent"
        >
          {i18nService.t('presetGoChat')}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="w-full rounded-xl py-2 text-xs font-medium text-claude-textSecondary hover:text-claude-accent dark:text-claude-darkTextSecondary dark:hover:text-claude-accent transition-colors"
        >
          {i18nService.t('settings')}
        </button>
      </div>
    </div>
  </div>
);

export default LobsterPondView;

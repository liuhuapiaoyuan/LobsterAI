import React from 'react';
import { CoworkView } from '../components/cowork';
import { SkillsView } from '../components/skills';
import { ScheduledTasksView } from '../components/scheduledTasks';
import { McpView } from '../components/mcp';
import AgentsView from '../components/agent/AgentsView';
import LobsterPondView from '../components/agent/LobsterPondView';
import EngineStartupOverlay from '../components/cowork/EngineStartupOverlay';
import type { SettingsOpenOptions } from '../components/Settings';

export type AppMainView = 'cowork' | 'skills' | 'scheduledTasks' | 'mcp' | 'lobsterPond' | 'agents';

export interface MainViewSwitchProps {
  mainView: AppMainView;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  updateBadgeWhenCollapsed: React.ReactNode;
  onRequestAppSettings: (options?: SettingsOpenOptions) => void;
  onShowSkills: () => void;
  onShowCowork: () => void;
  onShowAgents?: () => void;
}

const MainViewSwitch: React.FC<MainViewSwitchProps> = ({
  mainView,
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  updateBadgeWhenCollapsed,
  onRequestAppSettings,
  onShowSkills,
  onShowCowork,
  onShowAgents,
}) => (
  <>
    <EngineStartupOverlay />
    {mainView === 'skills' ? (
      <SkillsView
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        updateBadge={updateBadgeWhenCollapsed}
      />
    ) : mainView === 'scheduledTasks' ? (
      <ScheduledTasksView
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        updateBadge={updateBadgeWhenCollapsed}
      />
    ) : mainView === 'mcp' ? (
      <McpView
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        updateBadge={updateBadgeWhenCollapsed}
      />
    ) : mainView === 'lobsterPond' ? (
      <LobsterPondView
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        onShowCowork={onShowCowork}
        onShowAgents={onShowAgents}
        updateBadge={updateBadgeWhenCollapsed}
      />
    ) : mainView === 'agents' ? (
      <AgentsView
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        onShowCowork={onShowCowork}
        updateBadge={updateBadgeWhenCollapsed}
      />
    ) : (
      <CoworkView
        onRequestAppSettings={onRequestAppSettings}
        onShowSkills={onShowSkills}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        updateBadge={updateBadgeWhenCollapsed}
      />
    )}
  </>
);

export default MainViewSwitch;

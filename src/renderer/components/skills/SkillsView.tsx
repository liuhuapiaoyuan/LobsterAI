import React from 'react';
import { i18nService } from '../../services/i18n';
import SkillsManager from './SkillsManager';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';
import ComposeIcon from '../icons/ComposeIcon';
import WindowTitleBar from '../window/WindowTitleBar';
import AgentQuickSwitchBar from '../AgentQuickSwitchBar';

interface SkillsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onShowCowork: () => void;
  updateBadge?: React.ReactNode;
}

const SkillsView: React.FC<SkillsViewProps> = ({ isSidebarCollapsed, onToggleSidebar, onNewChat, onShowCowork, updateBadge }) => {
  const isMac = window.electron.platform === 'darwin';
  return (
    <div className="flex-1 flex flex-col dark:bg-claude-darkBg bg-claude-bg h-full">
      <div className="draggable flex h-12 items-center justify-between px-4   shrink-0">
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
            {i18nService.t('skills')}
          </h1>
        </div>
        <div className="non-draggable flex min-w-0 items-center gap-2 shrink-0">
          <AgentQuickSwitchBar onShowCowork={onShowCowork} />
          <WindowTitleBar inline />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <SkillsManager />
        </div>
      </div>
    </div>
  );
};

export default SkillsView;

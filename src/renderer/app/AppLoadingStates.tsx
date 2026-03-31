import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Settings, { type SettingsOpenOptions } from '../components/Settings';
import type { AppUpdateInfo } from '../services/appUpdate';

export const AppLoadingView: React.FC<{ windowsStandaloneTitleBar: React.ReactNode; loadingLabel: string }> = ({
  windowsStandaloneTitleBar,
  loadingLabel,
}) => (
  <div className="h-screen overflow-hidden flex flex-col">
    {windowsStandaloneTitleBar}
    <div className="flex-1 flex items-center justify-center dark:bg-claude-darkBg bg-claude-bg">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-claude-accent to-claude-accentHover flex items-center justify-center shadow-glow-accent animate-pulse">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </div>
        <div className="w-24 h-1 rounded-full bg-claude-accent/20 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-claude-accent animate-shimmer" />
        </div>
        <div className="dark:text-claude-darkText text-claude-text text-xl font-medium">{loadingLabel}</div>
      </div>
    </div>
  </div>
);

export interface AppInitErrorViewProps {
  windowsStandaloneTitleBar: React.ReactNode;
  initError: string;
  openSettingsLabel: string;
  onOpenSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
  settingsOptions: SettingsOpenOptions;
  onUpdateFound: (info: AppUpdateInfo) => void;
}

export const AppInitErrorView: React.FC<AppInitErrorViewProps> = ({
  windowsStandaloneTitleBar,
  initError,
  openSettingsLabel,
  onOpenSettings,
  showSettings,
  onCloseSettings,
  settingsOptions,
  onUpdateFound,
}) => (
  <div className="h-screen overflow-hidden flex flex-col">
    {windowsStandaloneTitleBar}
    <div className="flex-1 flex flex-col items-center justify-center dark:bg-claude-darkBg bg-claude-bg">
      <div className="flex flex-col items-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </div>
        <div className="dark:text-claude-darkText text-claude-text text-xl font-medium text-center">{initError}</div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-6 py-2.5 bg-claude-accent hover:bg-claude-accentHover text-white rounded-xl shadow-md transition-colors text-sm font-medium"
        >
          {openSettingsLabel}
        </button>
      </div>
      {showSettings && (
        <Settings
          onClose={onCloseSettings}
          initialTab={settingsOptions.initialTab}
          notice={settingsOptions.notice}
          onUpdateFound={onUpdateFound}
        />
      )}
    </div>
  </div>
);

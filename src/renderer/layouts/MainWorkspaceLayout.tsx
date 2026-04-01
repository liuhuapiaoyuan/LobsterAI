import React from 'react';

export interface MainWorkspaceLayoutProps {
  isSidebarCollapsed: boolean;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shell around the main content panel (sidebar + rounded workspace). Used by App for incremental UI refactors.
 */
const MainWorkspaceLayout: React.FC<MainWorkspaceLayoutProps> = ({ isSidebarCollapsed, sidebar, children }) => (
  <div className="flex flex-1 min-h-0 overflow-hidden">
    {sidebar}
    <div className={`flex-1 min-w-0 py-1.5 pr-1.5 ${isSidebarCollapsed ? 'pl-1.5' : ''}`}>
      <div className="relative h-full min-h-0 rounded-xl dark:bg-claude-darkBg bg-claude-bg overflow-hidden ">{children}</div>
    </div>
  </div>
);

export default MainWorkspaceLayout;

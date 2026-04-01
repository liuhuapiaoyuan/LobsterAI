import React, { useCallback } from 'react';
import {
  Clock,
  MessageSquarePlus,
  Plug2,
  Puzzle,
  Users,
} from 'lucide-react';
import { DockTabs, type DockNavItem } from '@/components/ui/dock-tabs';
import { i18nService } from '../services/i18n';
import type { AppMainView } from '../app/MainViewSwitch';

export interface AppMainDockProps {
  activeView: AppMainView;
  onNewChat: () => void;
  onShowScheduledTasks: () => void;
  onShowSkills: () => void;
  onShowMcp: () => void;
  onShowLobsterPond: () => void;
  onShowAgents: () => void;
}

/**
 * Full-width bottom dock for primary navigation (macOS-style).
 */
const AppMainDock: React.FC<AppMainDockProps> = ({
  activeView,
  onNewChat,
  onShowScheduledTasks,
  onShowSkills,
  onShowMcp,
  onShowLobsterPond,
  onShowAgents,
}) => {
  const handleSelect = useCallback(
    (id: string) => {
      switch (id) {
        case 'cowork':
          onNewChat();
          break;
        case 'scheduledTasks':
          onShowScheduledTasks();
          break;
        case 'skills':
          onShowSkills();
          break;
        case 'mcp':
          onShowMcp();
          break;
        case 'lobsterPond':
          onShowLobsterPond();
          break;
        case 'agents':
          onShowAgents();
          break;
        default:
          break;
      }
    },
    [
      onNewChat,
      onShowScheduledTasks,
      onShowSkills,
      onShowMcp,
      onShowLobsterPond,
      onShowAgents,
    ],
  );

  const items: DockNavItem[] = [
    {
      id: 'cowork',
      label: i18nService.t('newChat'),
      icon: <MessageSquarePlus className="h-5 w-5 group-hover:scale-150 transition-transform duration-300 " strokeWidth={2} />,
      color: 'bg-sky-500',
    },
    {
      id: 'scheduledTasks',
      label: i18nService.t('scheduledTasks'),
      icon: <Clock className="h-5 w-5 group-hover:scale-150 transition-transform duration-300 " strokeWidth={2} />,
      color: 'bg-amber-500',
    },
    {
      id: 'skills',
      label: i18nService.t('skills'),
      icon: <Puzzle className="h-5 w-5 group-hover:scale-150 transition-transform duration-300 " strokeWidth={2} />,
      color: 'bg-violet-500',
    },
    {
      id: 'mcp',
      label: i18nService.t('mcpServers'),
      icon: <Plug2 className="h-5 w-5 group-hover:scale-150 transition-transform duration-300 " strokeWidth={2} />,
      color: 'bg-emerald-600',
    },
    {
      id: 'lobsterPond',
      label: i18nService.t('lobsterPond'),
      icon:<img src="lobster-yuan.png" className='w-6 h-6 group-hover:scale-150 transition-transform duration-300 ' /> , 
      // icon: <Sparkles className="h-5 w-5" strokeWidth={2} />,
      color: 'bg-rose-50',
    },
    {
      id: 'agents',
      label: i18nService.t('myAgents'),
      icon: <Users className="h-5 w-5  group-hover:scale-150 " strokeWidth={2} />,
      color: 'bg-slate-600 dark:bg-slate-500',
    },
  ];

  return (
    <div
      role="navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-3 pt-2"
    >
      <div className="pointer-events-auto w-full max-w-4xl">
        <DockTabs
          variant="bar"
          items={items}
          activeId={activeView}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
};

export default AppMainDock;

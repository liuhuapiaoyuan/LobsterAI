import React from 'react';
import type { LocalizedQuickAction } from '../../types/quickAction';
import PresentationChartBarIcon from '../icons/PresentationChartBarIcon';
import GlobeAltIcon from '../icons/GlobeAltIcon';
import DevicePhoneMobileIcon from '../icons/DevicePhoneMobileIcon';
import ChartBarIcon from '../icons/ChartBarIcon';
import AcademicCapIcon from '../icons/AcademicCapIcon';

interface QuickActionBarProps {
  actions: LocalizedQuickAction[];
  onActionSelect: (actionId: string) => void;
  /** Pill style for moon / glass cowork home */
  variant?: 'default' | 'moon';
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PresentationChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  AcademicCapIcon,
};

const QuickActionBar: React.FC<QuickActionBarProps> = ({ actions, onActionSelect, variant = 'default' }) => {
  if (actions.length === 0) {
    return null;
  }

  const moonButton =
    'flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-claude-accent/40 hover:bg-white hover:text-claude-text focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/35';
  const defaultButton =
    'flex items-center gap-2 rounded-full border border-claude-border bg-claude-surface px-4 py-2 text-sm font-medium text-claude-textSecondary shadow-subtle transition-all duration-200 ease-out hover:border-claude-accent/40 hover:bg-claude-surfaceHover hover:text-claude-text focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/30 dark:border-claude-darkBorder dark:bg-claude-darkSurface dark:text-claude-darkTextSecondary dark:hover:bg-claude-darkSurfaceHover dark:hover:text-claude-darkText';

  return (
    <div className={variant === 'moon' ? 'flex flex-wrap items-center justify-center gap-3' : 'flex flex-wrap items-center justify-center gap-2.5'}>
      {actions.map((action) => {
        const IconComponent = iconMap[action.icon];

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onActionSelect(action.id)}
            className={variant === 'moon' ? moonButton : defaultButton}
          >
            {IconComponent && (
              <IconComponent
                className={
                  variant === 'moon'
                    ? 'h-4 w-4 text-slate-500'
                    : 'h-4 w-4 dark:text-claude-darkTextSecondary text-claude-textSecondary'
                }
              />
            )}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionBar;

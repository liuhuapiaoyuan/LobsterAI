import React from 'react';

type SettingsCardProps = {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  className = '',
  children,
}) => (
  <div
    className={`space-y-3 rounded-xl border px-4 py-4 dark:border-claude-darkBorder border-claude-border ${className}`}
  >
    <div className="space-y-1">
      <div className="text-sm font-medium dark:text-claude-darkText text-claude-text">
        {title}
      </div>
      {description ? (
        <p className="text-xs dark:text-claude-darkTextSecondary text-claude-textSecondary">
          {description}
        </p>
      ) : null}
    </div>
    {children}
  </div>
);

export default SettingsCard;

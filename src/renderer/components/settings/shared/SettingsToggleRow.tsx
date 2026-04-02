import React from 'react';

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  busy?: boolean;
  onChange: () => void;
};

const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
  label,
  description,
  checked,
  disabled,
  busy,
  onChange,
}) => (
  <div>
    <h4 className="text-sm font-medium dark:text-claude-darkText text-claude-text mb-3">
      {label}
    </h4>
    <label className="flex items-center justify-between cursor-pointer">
      {description ? (
        <span className="text-sm dark:text-claude-darkSecondaryText text-claude-secondaryText pr-3">
          {description}
        </span>
      ) : (
        <span />
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled || busy}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          busy ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          checked ? 'bg-claude-accent' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  </div>
);

export default SettingsToggleRow;

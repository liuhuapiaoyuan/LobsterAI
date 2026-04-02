import React from 'react';
import { i18nService } from '../../../services/i18n';

export type AboutPanelProps = {
  appVersion: string;
  logoClickCount: number;
  setLogoClickCount: React.Dispatch<React.SetStateAction<number>>;
  testModeUnlocked: boolean;
  setTestModeUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
  updateCheckStatus: 'idle' | 'checking' | 'upToDate' | 'error';
  handleCheckUpdate: () => void;
  testMode: boolean;
  setTestMode: React.Dispatch<React.SetStateAction<boolean>>;
  isExportingLogs: boolean;
  handleExportLogs: () => void | Promise<void>;
};

const AboutPanel: React.FC<AboutPanelProps> = ({
  appVersion,
  logoClickCount,
  setLogoClickCount,
  testModeUnlocked,
  setTestModeUnlocked,
  updateCheckStatus,
  handleCheckUpdate,
  testMode,
  setTestMode,
  isExportingLogs,
  handleExportLogs,
}) => (
  <div className="flex min-h-full flex-col items-center pt-6 pb-3">
    <img
      src="logo.png"
      alt="YuanAI"
      className="w-16 h-16 mb-3 cursor-pointer select-none"
      onClick={() => {
        const next = logoClickCount + 1;
        setLogoClickCount(next);
        if (next >= 10 && !testModeUnlocked) {
          setTestModeUnlocked(true);
        }
      }}
    />
    <h3 className="text-lg font-semibold dark:text-claude-darkText text-claude-text">YuanAI</h3>
    <span className="text-xs dark:text-claude-darkTextSecondary text-claude-textSecondary mt-1">v{appVersion}</span>

    <div className="w-full mt-8 rounded-xl border border-claude-border dark:border-claude-darkBorder overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-claude-border dark:border-claude-darkBorder">
        <span className="text-sm dark:text-claude-darkText text-claude-text">{i18nService.t('aboutVersion')}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary">{appVersion}</span>
          <button
            type="button"
            disabled={updateCheckStatus === 'checking'}
            onClick={(e) => {
              e.stopPropagation();
              void handleCheckUpdate();
            }}
            className="text-xs px-2 py-0.5 rounded-md border border-claude-border dark:border-claude-darkBorder dark:text-claude-darkTextSecondary text-claude-textSecondary hover:text-claude-accent dark:hover:text-claude-accent hover:border-claude-accent dark:hover:border-claude-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateCheckStatus === 'checking' && i18nService.t('updateChecking')}
            {updateCheckStatus === 'upToDate' && i18nService.t('updateUpToDate')}
            {updateCheckStatus === 'error' && i18nService.t('updateCheckFailed')}
            {updateCheckStatus === 'idle' && i18nService.t('checkForUpdate')}
          </button>
        </div>
      </div>

      {testModeUnlocked && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm dark:text-claude-darkText text-claude-text">{i18nService.t('testMode')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={testMode}
            onClick={() => setTestMode((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              testMode ? 'bg-claude-accent' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                testMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}
    </div>

    <div className="mt-auto w-full pt-14 pb-2 flex flex-col items-center">
      <div className="flex items-center justify-center text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleExportLogs();
          }}
          disabled={isExportingLogs}
          className="bg-transparent border-none appearance-none px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md cursor-pointer hover:text-claude-accent dark:hover:text-claude-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExportingLogs ? i18nService.t('aboutExportingLogs') : i18nService.t('aboutExportLogs')}
        </button>
      </div>
    </div>
  </div>
);

export default AboutPanel;

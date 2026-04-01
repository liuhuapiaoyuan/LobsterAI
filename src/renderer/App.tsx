import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import Settings, { type SettingsOpenOptions } from './components/Settings';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import WindowTitleBar from './components/window/WindowTitleBar';
import CoworkPermissionModal from './components/cowork/CoworkPermissionModal';
import CoworkQuestionWizard from './components/cowork/CoworkQuestionWizard';
import { configService } from './services/config';
import { apiService } from './services/api';
import { coworkService } from './services/cowork';
import { checkForAppUpdate, type AppUpdateInfo, type AppUpdateDownloadProgress, UPDATE_POLL_INTERVAL_MS, UPDATE_HEARTBEAT_INTERVAL_MS } from './services/appUpdate';
import { defaultConfig } from './config';
import { setAvailableModels } from './store/slices/modelSlice';
import { clearSelection } from './store/slices/quickActionSlice';
import type { CoworkPermissionResult } from './types/cowork';
import { i18nService } from './services/i18n';
import { matchesShortcut } from './services/shortcuts';
import AppUpdateBadge from './components/update/AppUpdateBadge';
import AppUpdateModal from './components/update/AppUpdateModal';
import PrivacyDialog from './components/PrivacyDialog';
import { useAppBootstrap } from './app/useAppBootstrap';
import MainViewSwitch, { type AppMainView } from './app/MainViewSwitch';
import { AppLoadingView, AppInitErrorView } from './app/AppLoadingStates';
import MainWorkspaceLayout from './layouts/MainWorkspaceLayout';
import AppMainDock from './components/AppMainDock';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsOptions, setSettingsOptions] = useState<SettingsOpenOptions>({});
  const [mainView, setMainView] = useState<AppMainView>('cowork');
  const { isInitialized, initError, privacyAgreed, setPrivacyAgreed } = useAppBootstrap();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, forceLanguageRefresh] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateModalState, setUpdateModalState] = useState<'info' | 'downloading' | 'installing' | 'error'>('info');
  const [downloadProgress, setDownloadProgress] = useState<AppUpdateDownloadProgress | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const dispatch = useDispatch();
  const selectedModel = useSelector((state: RootState) => state.model.selectedModel);
  const currentSessionId = useSelector((state: RootState) => state.cowork.currentSessionId);
  const pendingPermissions = useSelector((state: RootState) => state.cowork.pendingPermissions);
  const pendingPermission = pendingPermissions[0] ?? null;
  const isWindows = window.electron.platform === 'win32';

  useEffect(() => {
    const unsubscribe = i18nService.subscribe(() => {
      forceLanguageRefresh((prev) => prev + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Renderer] Network online');
      window.electron.networkStatus.send('online');
    };

    const handleOffline = () => {
      console.log('[Renderer] Network offline');
      window.electron.networkStatus.send('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !selectedModel?.id) return;
    const config = configService.getConfig();
    if (
      config.model.defaultModel === selectedModel.id &&
      (config.model.defaultModelProvider ?? '') === (selectedModel.providerKey ?? '')
    ) {
      return;
    }
    void configService.updateConfig({
      model: {
        ...config.model,
        defaultModel: selectedModel.id,
        defaultModelProvider: selectedModel.providerKey,
      },
    });
  }, [isInitialized, selectedModel?.id, selectedModel?.providerKey]);

  const handleShowSettings = useCallback((options?: SettingsOpenOptions) => {
    setSettingsOptions({
      initialTab: options?.initialTab,
      notice: options?.notice,
    });
    setShowSettings(true);
  }, []);

  const handleShowSkills = useCallback(() => {
    setMainView('skills');
  }, []);

  const handleShowCowork = useCallback(() => {
    setMainView('cowork');
  }, []);

  const handleShowScheduledTasks = useCallback(() => {
    setMainView('scheduledTasks');
  }, []);

  const handleShowMcp = useCallback(() => {
    setMainView('mcp');
  }, []);

  const handleShowAgents = useCallback(() => {
    setMainView('agents');
  }, []);

  const handleShowLobsterPond = useCallback(() => {
    setMainView('lobsterPond');
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    const shouldClearInput = mainView === 'cowork' || !!currentSessionId;
    coworkService.clearSession();
    dispatch(clearSelection());
    setMainView('cowork');
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('cowork:focus-input', {
          detail: { clear: shouldClearInput },
        })
      );
    }, 0);
  }, [dispatch, mainView, currentSessionId]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  const handleShowLogin = useCallback(() => {
    showToast(i18nService.t('featureInDevelopment'));
  }, [showToast]);

  const runUpdateCheck = useCallback(async () => {
    try {
      const currentVersion = await window.electron.appInfo.getVersion();
      const nextUpdate = await checkForAppUpdate(currentVersion);
      setUpdateInfo(nextUpdate);
      if (!nextUpdate) {
        setShowUpdateModal(false);
      }
    } catch (error) {
      console.error('Failed to check app update:', error);
      setUpdateInfo(null);
      setShowUpdateModal(false);
    }
  }, []);

  const handleOpenUpdateModal = useCallback(() => {
    if (!updateInfo) return;
    setUpdateModalState('info');
    setUpdateError(null);
    setDownloadProgress(null);
    setShowUpdateModal(true);
  }, [updateInfo]);

  const handleUpdateFound = useCallback((info: AppUpdateInfo) => {
    setUpdateInfo(info);
    setUpdateModalState('info');
    setUpdateError(null);
    setDownloadProgress(null);
    setShowUpdateModal(true);
  }, []);

  const handleConfirmUpdate = useCallback(async () => {
    if (!updateInfo) return;

    if (updateInfo.url.includes('#') || updateInfo.url.endsWith('/download-list')) {
      setShowUpdateModal(false);
      try {
        const result = await window.electron.shell.openExternal(updateInfo.url);
        if (!result.success) {
          showToast(i18nService.t('updateOpenFailed'));
        }
      } catch (error) {
        console.error('Failed to open update url:', error);
        showToast(i18nService.t('updateOpenFailed'));
      }
      return;
    }

    setUpdateModalState('downloading');
    setDownloadProgress(null);
    setUpdateError(null);

    const unsubscribe = window.electron.appUpdate.onDownloadProgress((progress) => {
      setDownloadProgress(progress);
    });

    try {
      const downloadResult = await window.electron.appUpdate.download(updateInfo.url);
      unsubscribe();

      if (!downloadResult.success) {
        if (downloadResult.error === 'Download cancelled') {
          return;
        }
        setUpdateModalState('error');
        setUpdateError(downloadResult.error || i18nService.t('updateDownloadFailed'));
        return;
      }

      setUpdateModalState('installing');
      const installResult = await window.electron.appUpdate.install(downloadResult.filePath!);

      if (!installResult.success) {
        setUpdateModalState('error');
        setUpdateError(installResult.error || i18nService.t('updateInstallFailed'));
      }
    } catch (error) {
      unsubscribe();
      const msg = error instanceof Error ? error.message : '';
      if (msg === 'Download cancelled') {
        return;
      }
      setUpdateModalState('error');
      setUpdateError(msg || i18nService.t('updateDownloadFailed'));
    }
  }, [updateInfo, showToast]);

  const handleCancelDownload = useCallback(async () => {
    await window.electron.appUpdate.cancelDownload();
    setUpdateModalState('info');
    setDownloadProgress(null);
  }, []);

  const handleRetryUpdate = useCallback(() => {
    setUpdateModalState('info');
    setUpdateError(null);
    setDownloadProgress(null);
  }, []);

  const handlePrivacyAccept = useCallback(async () => {
    await window.electron.store.set('privacy_agreed', true);
    setPrivacyAgreed(true);
  }, [setPrivacyAgreed]);

  const handlePrivacyReject = useCallback(() => {
    window.electron.window.close();
  }, []);

  const handlePermissionResponse = useCallback(async (result: CoworkPermissionResult) => {
    if (!pendingPermission) return;
    await coworkService.respondToPermission(pendingPermission.requestId, result);
  }, [pendingPermission]);

  const handleCloseSettings = () => {
    setShowSettings(false);
    const config = configService.getConfig();
    apiService.setConfig({
      apiKey: config.api.key,
      baseUrl: config.api.baseUrl,
    });

    if (config.providers) {
      const allModels: { id: string; name: string; provider?: string; providerKey?: string; supportsImage?: boolean }[] = [];
      Object.entries(config.providers).forEach(([providerName, providerConfig]) => {
        if (providerConfig.enabled && providerConfig.models) {
          providerConfig.models.forEach((model: { id: string; name: string; supportsImage?: boolean }) => {
            allModels.push({
              id: model.id,
              name: model.name,
              provider: providerName.charAt(0).toUpperCase() + providerName.slice(1),
              providerKey: providerName,
              supportsImage: model.supportsImage ?? false,
            });
          });
        }
      });
      if (allModels.length > 0) {
        dispatch(setAvailableModels(allModels));
      }
    }
  };

  const isShortcutInputActive = () => {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return false;
    return activeElement.dataset.shortcutInput === 'true';
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isShortcutInputActive()) return;

      const { shortcuts } = configService.getConfig();
      const activeShortcuts = {
        ...defaultConfig.shortcuts,
        ...(shortcuts ?? {}),
      };

      if (matchesShortcut(event, activeShortcuts.newChat)) {
        event.preventDefault();
        handleNewChat();
        return;
      }

      if (matchesShortcut(event, activeShortcuts.search)) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('cowork:shortcut:search'));
        return;
      }

      if (matchesShortcut(event, activeShortcuts.settings)) {
        event.preventDefault();
        handleShowSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleShowSettings, handleNewChat]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      if (message) showToast(message);
    };
    window.addEventListener('app:showToast', handler);
    return () => window.removeEventListener('app:showToast', handler);
  }, [showToast]);

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('app:openSettings', () => {
      handleShowSettings();
    });
    return unsubscribe;
  }, [handleShowSettings]);

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('app:newTask', () => {
      handleNewChat();
    });
    return unsubscribe;
  }, [handleNewChat]);

  useEffect(() => {
    if (!isInitialized) return;

    let cancelled = false;
    let lastCheckTime = 0;

    const maybeCheck = async () => {
      if (cancelled) return;
      const now = Date.now();
      if (lastCheckTime > 0 && now - lastCheckTime < UPDATE_POLL_INTERVAL_MS) return;
      lastCheckTime = now;
      await runUpdateCheck();
    };

    void maybeCheck();

    const timer = window.setInterval(() => {
      void maybeCheck();
    }, UPDATE_HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void maybeCheck();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized, runUpdateCheck]);

  const permissionModal = useMemo(() => {
    if (!pendingPermission) return null;

    const isQuestionTool = pendingPermission.toolName === 'AskUserQuestion';
    if (isQuestionTool && pendingPermission.toolInput) {
      const rawQuestions = (pendingPermission.toolInput as Record<string, unknown>).questions;
      const hasMultipleQuestions = Array.isArray(rawQuestions) && rawQuestions.length > 1;

      if (hasMultipleQuestions) {
        return (
          <CoworkQuestionWizard permission={pendingPermission} onRespond={handlePermissionResponse} />
        );
      }
    }

    return (
      <CoworkPermissionModal permission={pendingPermission} onRespond={handlePermissionResponse} />
    );
  }, [pendingPermission, handlePermissionResponse]);

  const isOverlayActive = showSettings || showUpdateModal || pendingPermissions.length > 0;
  const updateBadge = updateInfo ? (
    <AppUpdateBadge latestVersion={updateInfo.latestVersion} onClick={handleOpenUpdateModal} />
  ) : null;
  const windowsStandaloneTitleBar = isWindows ? (
    <div className="draggable relative h-9  shrink-0 dark:bg-claude-darkSurfaceMuted bg-claude-surfaceMuted">
      <WindowTitleBar isOverlayActive={isOverlayActive} />
    </div>
  ) : null;

  if (!isInitialized) {
    return <AppLoadingView windowsStandaloneTitleBar={windowsStandaloneTitleBar} loadingLabel={i18nService.t('loading')} />;
  }

  if (initError) {
    return (
      <AppInitErrorView
        windowsStandaloneTitleBar={windowsStandaloneTitleBar}
        initError={initError}
        openSettingsLabel={i18nService.t('openSettings')}
        onOpenSettings={() => handleShowSettings()}
        showSettings={showSettings}
        onCloseSettings={handleCloseSettings}
        settingsOptions={settingsOptions}
        onUpdateFound={handleUpdateFound}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col dark:bg-claude-darkSurfaceMuted bg-claude-surfaceMuted">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <MainWorkspaceLayout
        isSidebarCollapsed={isSidebarCollapsed}
        sidebar={
          <Sidebar
            onShowLogin={handleShowLogin}
            onShowSettings={handleShowSettings}
            onShowCowork={handleShowCowork}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            updateBadge={!isSidebarCollapsed ? updateBadge : null}
          />
        }
      >
        <MainViewSwitch
          mainView={mainView}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onNewChat={handleNewChat}
          updateBadgeWhenCollapsed={isSidebarCollapsed ? updateBadge : null}
          onRequestAppSettings={handleShowSettings}
          onShowSkills={handleShowSkills}
          onShowCowork={handleShowCowork}
          onShowAgents={handleShowAgents}
          onShowLobsterPond={handleShowLobsterPond}
        />
      </MainWorkspaceLayout>

      <AppMainDock
        activeView={mainView}
        onNewChat={handleNewChat}
        onShowScheduledTasks={handleShowScheduledTasks}
        onShowSkills={handleShowSkills}
        onShowMcp={handleShowMcp}
        onShowLobsterPond={handleShowLobsterPond}
        onShowAgents={handleShowAgents}
      />

      {showSettings && (
        <Settings
          onClose={handleCloseSettings}
          initialTab={settingsOptions.initialTab}
          notice={settingsOptions.notice}
          onUpdateFound={handleUpdateFound}
        />
      )}
      {showUpdateModal && updateInfo && (
        <AppUpdateModal
          updateInfo={updateInfo}
          onCancel={() => {
            if (updateModalState === 'info' || updateModalState === 'error') {
              setShowUpdateModal(false);
              setUpdateModalState('info');
              setUpdateError(null);
              setDownloadProgress(null);
            }
          }}
          onConfirm={handleConfirmUpdate}
          modalState={updateModalState}
          downloadProgress={downloadProgress}
          errorMessage={updateError}
          onCancelDownload={handleCancelDownload}
          onRetry={handleRetryUpdate}
        />
      )}
      {permissionModal}
      {privacyAgreed === false && (
        <PrivacyDialog onAccept={handlePrivacyAccept} onReject={handlePrivacyReject} />
      )}
    </div>
  );
};

export default App;

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { store } from '../store';
import { configService } from '../services/config';
import { apiService } from '../services/api';
import { themeService } from '../services/theme';
import { authService } from '../services/auth';
import { scheduledTaskService } from '../services/scheduledTask';
import { i18nService } from '../services/i18n';
import { setAvailableModels, setSelectedModel } from '../store/slices/modelSlice';
import type { ApiConfig } from '../services/api';

export interface UseAppBootstrapResult {
  isInitialized: boolean;
  initError: string | null;
  privacyAgreed: boolean | null;
  setPrivacyAgreed: (v: boolean) => void;
}

export function useAppBootstrap(): UseAppBootstrapResult {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean | null>(null);
  const hasInitialized = useRef(false);

  const waitWithTimeout = useCallback(
    async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
      return await new Promise<T>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise.then(
          (value) => {
            window.clearTimeout(timer);
            resolve(value);
          },
          (error) => {
            window.clearTimeout(timer);
            reject(error);
          }
        );
      });
    },
    []
  );

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initializeApp = async () => {
      try {
        console.info('[App] initializeApp: start');
        document.documentElement.classList.add(`platform-${window.electron.platform}`);

        console.info('[App] initializeApp: configService.init');
        await waitWithTimeout(configService.init(), 5000, 'configService.init');

        console.info('[App] initializeApp: themeService.initialize');
        themeService.initialize();

        console.info('[App] initializeApp: i18nService.initialize');
        await waitWithTimeout(i18nService.initialize(), 5000, 'i18nService.initialize');

        console.info('[App] initializeApp: authService.init');
        await authService.init();

        console.info('[App] initializeApp: configService.getConfig');
        const config = await configService.getConfig();

        const apiConfig: ApiConfig = {
          apiKey: config.api.key,
          baseUrl: config.api.baseUrl,
        };
        apiService.setConfig(apiConfig);

        const providerModels: { id: string; name: string; provider?: string; providerKey?: string; supportsImage?: boolean }[] = [];
        if (config.providers) {
          Object.entries(config.providers).forEach(([providerName, providerConfig]) => {
            if (providerConfig.enabled && providerConfig.models) {
              providerConfig.models.forEach((model: { id: string; name: string; supportsImage?: boolean }) => {
                providerModels.push({
                  id: model.id,
                  name: model.name,
                  provider: providerName.charAt(0).toUpperCase() + providerName.slice(1),
                  providerKey: providerName,
                  supportsImage: model.supportsImage ?? false,
                });
              });
            }
          });
        }
        const fallbackModels = config.model.availableModels.map((model) => ({
          id: model.id,
          name: model.name,
          providerKey: undefined,
          supportsImage: model.supportsImage ?? false,
        }));
        const resolvedModels = providerModels.length > 0 ? providerModels : fallbackModels;
        if (resolvedModels.length > 0) {
          dispatch(setAvailableModels(resolvedModels));
          const allModels = store.getState().model.availableModels;
          const preferredModel =
            allModels.find(
              (model) =>
                model.id === config.model.defaultModel &&
                (!config.model.defaultModelProvider || model.providerKey === config.model.defaultModelProvider)
            ) ?? allModels[0];
          dispatch(setSelectedModel(preferredModel));
        }

        const agreed = await window.electron.store.get('privacy_agreed');
        setPrivacyAgreed(agreed === true);

        setIsInitialized(true);
        console.info('[App] initializeApp: shell ready');

        void waitWithTimeout(scheduledTaskService.init(), 5000, 'scheduledTaskService.init').catch((error) => {
          console.error('[App] initializeApp: scheduledTaskService.init failed:', error);
        });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(i18nService.t('initializationError'));
        setIsInitialized(true);
      }
    };

    void initializeApp();
  }, [dispatch, waitWithTimeout]);

  return { isInitialized, initError, privacyAgreed, setPrivacyAgreed };
}

import React from 'react';
import { Menu } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { setSelectedModel, isSameModelIdentity, getModelIdentityKey } from '../store/slices/modelSlice';
import type { Model } from '../store/slices/modelSlice';
import { i18nService } from '../services/i18n';
import { cn } from '@/lib/utils';
import {
  claudePopoverPanelVariants,
  claudeMenuItemRowVariants,
  claudeMenuGroupHeaderClass,
  claudeMenuDividerClass,
  claudeModelMenuButtonVariants,
} from './ui/claude-menu';

interface ModelSelectorProps {
  dropdownDirection?: 'up' | 'down';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ dropdownDirection = 'down' }) => {
  const dispatch = useDispatch();
  const selectedModel = useSelector((state: RootState) => state.model.selectedModel);
  const availableModels = useSelector((state: RootState) => state.model.availableModels);

  const handleModelSelect = (model: Model) => {
    dispatch(setSelectedModel(model));
  };

  if (availableModels.length === 0) {
    return (
      <div className="rounded-xl bg-claude-surface px-3 py-1.5 text-sm text-claude-textSecondary dark:bg-claude-darkSurface dark:text-claude-darkTextSecondary">
        {i18nService.t('modelSelectorNoModels')}
      </div>
    );
  }

  const dropdownPositionClass =
    dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1';

  const serverModels = availableModels.filter((m) => m.isServerModel);
  const userModels = availableModels.filter((m) => !m.isServerModel);
  const hasBothGroups = serverModels.length > 0 && userModels.length > 0;

  const renderGroupHeader = (label: string) => (
    <div className={claudeMenuGroupHeaderClass} role="presentation">
      {label}
    </div>
  );

  const renderModelItem = (model: Model) => {
    const selected = isSameModelIdentity(model, selectedModel);
    return (
      <Menu.Item
        key={getModelIdentityKey(model)}
        as="button"
        type="button"
        onClick={() => handleModelSelect(model)}
        className={({ active }) =>
          cn(
            claudeMenuItemRowVariants({ active }),
            selected && !active && 'bg-claude-surfaceHover/50 dark:bg-claude-darkSurfaceHover/50',
          )
        }
      >
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{model.name}</span>
            {model.supportsImage && (
              <span className="whitespace-nowrap rounded-md bg-claude-accent/10 px-1.5 py-0.5 text-[10px] leading-none text-claude-accent">
                {i18nService.t('imageInput')}
              </span>
            )}
          </div>
          {model.provider && (
            <span className="text-xs text-claude-textSecondary dark:text-claude-darkTextSecondary">
              {model.provider}
            </span>
          )}
        </div>
        {selected && <CheckIcon className="h-4 w-4 flex-shrink-0 text-claude-accent" />}
      </Menu.Item>
    );
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={({ open }) => cn(claudeModelMenuButtonVariants({ open }))}
      >
        <span className="text-sm font-medium">{selectedModel.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-claude-textSecondary dark:text-claude-darkTextSecondary" />
      </Menu.Button>

      <Menu.Items
        className={cn(
          'absolute left-0 max-h-64 overflow-y-auto popover-enter',
          dropdownPositionClass,
          claudePopoverPanelVariants({ width: 'md' }),
        )}
      >
        {hasBothGroups ? (
          <>
            {renderGroupHeader(i18nService.t('modelGroupServer'))}
            {serverModels.map(renderModelItem)}
            <div className={claudeMenuDividerClass} role="presentation" />
            {renderGroupHeader(i18nService.t('modelGroupUser'))}
            {userModels.map(renderModelItem)}
          </>
        ) : (
          availableModels.map(renderModelItem)
        )}
      </Menu.Items>
    </Menu>
  );
};

export default ModelSelector;

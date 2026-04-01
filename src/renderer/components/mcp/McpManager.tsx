import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '../icons/SearchIcon';
import { i18nService } from '../../services/i18n';
import { mcpService } from '../../services/mcp';
import { setMcpServers } from '../../store/slices/mcpSlice';
import { RootState } from '../../store';
import { McpServerConfig, McpServerFormData, McpRegistryEntry, McpMarketplaceCategoryInfo } from '../../types/mcp';
import { mcpRegistry, mcpCategories } from '../../data/mcpRegistry';
import ErrorMessage from '../ErrorMessage';
import McpServerFormModal from './McpServerFormModal';
import { McpMarketplaceEntryCard, McpServerInstanceCard } from './McpCards';

type McpTab = 'installed' | 'marketplace' | 'custom';

const McpManager: React.FC = () => {
  const dispatch = useDispatch();
  const servers = useSelector((state: RootState) => state.mcp.servers);

  const [activeTab, setActiveTab] = useState<McpTab>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<McpServerConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServerConfig | null>(null);
  const [installingRegistry, setInstallingRegistry] = useState<McpRegistryEntry | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [dynamicRegistry, setDynamicRegistry] = useState<McpRegistryEntry[]>(mcpRegistry);
  const [dynamicCategories, setDynamicCategories] = useState<ReadonlyArray<{ id: string; key: string; name_zh?: string; name_en?: string }>>(mcpCategories);
  const [bridgeSyncing, setBridgeSyncing] = useState(false);
  const [bridgeSyncResult, setBridgeSyncResult] = useState<{ tools: number; error?: string } | null>(null);
  const currentLanguage = i18nService.getLanguage();

  useEffect(() => {
    let isActive = true;
    const loadServers = async () => {
      const loaded = await mcpService.loadServers();
      if (!isActive) return;
      dispatch(setMcpServers(loaded));
    };
    loadServers();
    return () => { isActive = false; };
  }, [dispatch]);

  useEffect(() => {
    let isActive = true;
    const fetchMarketplace = async () => {
      const result = await mcpService.fetchMarketplace();
      if (!isActive || !result) return;
      setDynamicRegistry(result.registry);
      const cats: Array<{ id: string; key: string; name_zh?: string; name_en?: string }> = [
        { id: 'all', key: 'mcpCategoryAll' },
        ...result.categories
          .filter((c: McpMarketplaceCategoryInfo) => c.id !== 'all')
          .map((c: McpMarketplaceCategoryInfo) => ({
            id: c.id,
            key: '',
            name_zh: c.name_zh,
            name_en: c.name_en,
          })),
      ];
      setDynamicCategories(cats);
    };
    fetchMarketplace();
    return () => { isActive = false; };
  }, []);

  const installedRegistryIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of servers) {
      if (s.registryId) ids.add(s.registryId);
    }
    return ids;
  }, [servers]);

  const getRegistryEntryDescription = (entry: McpRegistryEntry): string => {
    const remoteDescription = currentLanguage === 'zh' ? entry.description_zh : entry.description_en;
    if (remoteDescription) return remoteDescription;
    if (entry.descriptionKey) return i18nService.t(entry.descriptionKey);
    return '';
  };

  const getStdioCommandSummary = (command?: string, args?: string[]): string => {
    if (!command) return '';
    if (!args || args.length === 0) return command;
    return `${command} ${args[args.length - 1]}`;
  };

  const getRegistryEntryForServer = (server: McpServerConfig): McpRegistryEntry | undefined => {
    if (server.registryId) {
      return dynamicRegistry.find(entry => entry.id === server.registryId);
    }
    if (!server.isBuiltIn) return undefined;
    return dynamicRegistry.find((entry) => (
      entry.name.toLowerCase() === server.name.toLowerCase()
      && entry.transportType === server.transportType
      && entry.command === server.command
    ));
  };

  const getRegistryCategoryLabel = (entry: McpRegistryEntry): string | undefined => {
    const cat = dynamicCategories.find(c => c.id === entry.category);
    if (cat && cat.id !== 'all') {
      const label = (currentLanguage === 'zh' ? cat.name_zh : cat.name_en)?.trim();
      if (label) return label;
      if (cat.key) return i18nService.t(cat.key);
    }
    return entry.categoryKey ? i18nService.t(entry.categoryKey) : undefined;
  };

  const getTransportSummary = (server: McpServerConfig): string => {
    if (server.transportType === 'stdio') {
      const parts = [server.command || ''];
      if (server.args && server.args.length > 0) {
        parts.push(server.args[0]);
        if (server.args.length > 1) parts.push('...');
      }
      return parts.join(' ');
    }
    return server.url || '';
  };

  const getInstalledDescription = (server: McpServerConfig): string => {
    const persistedDescription = server.description?.trim();
    if (persistedDescription) return persistedDescription;
    const registryEntry = getRegistryEntryForServer(server);
    if (registryEntry) {
      const registryDescription = getRegistryEntryDescription(registryEntry).trim();
      if (registryDescription) return registryDescription;
    }
    return getTransportSummary(server);
  };

  const filteredInstalled = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return servers;
    return servers.filter(server =>
      server.name.toLowerCase().includes(query)
      || getInstalledDescription(server).toLowerCase().includes(query)
    );
  }, [servers, searchQuery, dynamicRegistry, currentLanguage]);

  const filteredCustom = useMemo(() => {
    const custom = servers.filter(s => !s.isBuiltIn);
    const query = searchQuery.toLowerCase();
    if (!query) return custom;
    return custom.filter(s =>
      s.name.toLowerCase().includes(query)
      || s.description.toLowerCase().includes(query)
    );
  }, [servers, searchQuery]);

  const filteredMarketplace = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let entries = [...dynamicRegistry];
    if (query) {
      entries = entries.filter(e =>
        e.name.toLowerCase().includes(query)
        || getRegistryEntryDescription(e).toLowerCase().includes(query)
      );
    }
    if (activeCategory !== 'all') {
      entries = entries.filter(e => e.category === activeCategory);
    }
    return entries;
  }, [searchQuery, activeCategory, dynamicRegistry, currentLanguage]);

  const handleToggleEnabled = async (serverId: string) => {
    const targetServer = servers.find(s => s.id === serverId);
    if (!targetServer) return;
    try {
      const updatedServers = await mcpService.setServerEnabled(serverId, !targetServer.enabled);
      dispatch(setMcpServers(updatedServers));
      setActionError('');
      triggerBridgeRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : i18nService.t('mcpUpdateFailed'));
    }
  };

  const handleRequestDelete = (server: McpServerConfig) => {
    setActionError('');
    setPendingDelete(server);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    setActionError('');
    const result = await mcpService.deleteServer(pendingDelete.id);
    if (!result.success) {
      setActionError(result.error || i18nService.t('mcpDeleteFailed'));
      setIsDeleting(false);
      return;
    }
    if (result.servers) {
      dispatch(setMcpServers(result.servers));
    }
    setIsDeleting(false);
    setPendingDelete(null);
    triggerBridgeRefresh();
  };

  const handleOpenEditForm = (server: McpServerConfig) => {
    setEditingServer(server);
    setInstallingRegistry(null);
    setIsFormOpen(true);
  };

  const handleInstallFromRegistry = (entry: McpRegistryEntry) => {
    setEditingServer(null);
    setInstallingRegistry(entry);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingServer(null);
    setInstallingRegistry(null);
  };

  const handleSaveForm = async (data: McpServerFormData) => {
    setActionError('');
    if (editingServer && editingServer.id) {
      const result = await mcpService.updateServer(editingServer.id, data);
      if (!result.success) {
        setActionError(result.error || i18nService.t('mcpUpdateFailed'));
        return;
      }
      if (result.servers) {
        dispatch(setMcpServers(result.servers));
      }
    } else {
      const result = await mcpService.createServer(data);
      if (!result.success) {
        setActionError(result.error || i18nService.t('mcpCreateFailed'));
        return;
      }
      if (result.servers) {
        dispatch(setMcpServers(result.servers));
      }
    }
    handleCloseForm();
    triggerBridgeRefresh();
  };

  const handleOpenCreateForm = () => {
    setEditingServer(null);
    setInstallingRegistry(null);
    setIsFormOpen(true);
  };

  const existingNames = useMemo(() => servers.map(s => s.name), [servers]);

  /**
   * Trigger MCP bridge refresh after server config changes.
   * Shows loading state while MCP servers restart + gateway reloads.
   */
  const triggerBridgeRefresh = async () => {
    setBridgeSyncing(true);
    setBridgeSyncResult(null);
    try {
      const result = await mcpService.refreshBridge();
      setBridgeSyncResult({ tools: result.tools, error: result.error });
      // Auto-hide success message after 5 seconds
      if (!result.error) {
        setTimeout(() => setBridgeSyncResult(null), 5000);
      }
    } catch {
      setBridgeSyncResult({ tools: 0, error: 'MCP bridge refresh failed' });
    } finally {
      setBridgeSyncing(false);
    }
  };

  const marketplaceCount = useMemo(
    () => dynamicRegistry.length,
    [dynamicRegistry]
  );

  const customCount = useMemo(
    () => servers.filter(s => !s.isBuiltIn).length,
    [servers]
  );

  const tabClass = (tab: McpTab) =>
    `px-4 py-2 text-sm font-medium transition-colors relative ${
      activeTab === tab
        ? 'dark:text-claude-darkText text-claude-text'
        : 'dark:text-claude-darkTextSecondary text-claude-textSecondary hover:dark:text-claude-darkText hover:text-claude-text'
    }`;

  const tabIndicatorClass = (tab: McpTab) =>
    `absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors ${
      activeTab === tab ? 'bg-claude-accent' : 'bg-transparent'
    }`;

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary">
        {i18nService.t('mcpDescription')}
      </p>

      {actionError && (
        <ErrorMessage
          message={actionError}
          onClose={() => setActionError('')}
        />
      )}

      {/* MCP Bridge sync status */}
      {bridgeSyncing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600 border dark:border-blue-500/20 border-blue-200">
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {i18nService.t('mcpBridgeSyncing') || 'Syncing MCP tools...'}
        </div>
      )}
      {!bridgeSyncing && bridgeSyncResult && (
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${
          bridgeSyncResult.error
            ? 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 dark:border-red-500/20 border-red-200'
            : 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600 dark:border-green-500/20 border-green-200'
        }`}>
          <span>
            {bridgeSyncResult.error
              ? `${i18nService.t('mcpBridgeSyncError') || 'Sync failed'}: ${bridgeSyncResult.error}`
              : `${i18nService.t('mcpBridgeSyncDone') || 'MCP tools synced'}: ${bridgeSyncResult.tools} ${bridgeSyncResult.tools === 1 ? 'tool' : 'tools'}`
            }
          </span>
          <button
            type="button"
            onClick={() => setBridgeSyncResult(null)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-claude-darkTextSecondary text-claude-textSecondary" />
          <input
            type="text"
            placeholder={i18nService.t('searchMcpServers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl dark:bg-claude-darkSurface bg-claude-surface dark:text-claude-darkText text-claude-text dark:placeholder-claude-darkTextSecondary placeholder-claude-textSecondary border dark:border-claude-darkBorder border-claude-border focus:outline-none focus:ring-2 focus:ring-claude-accent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b dark:border-claude-darkBorder border-claude-border">
        <button type="button" onClick={() => setActiveTab('installed')} className={tabClass('installed')}>
          {i18nService.t('mcpInstalled')}
          {servers.length > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-claude-darkSurfaceHover bg-claude-surfaceHover">
              {servers.length}
            </span>
          )}
          <div className={tabIndicatorClass('installed')} />
        </button>
        <button type="button" onClick={() => setActiveTab('marketplace')} className={tabClass('marketplace')}>
          {i18nService.t('mcpMarketplace')}
          {marketplaceCount > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-claude-darkSurfaceHover bg-claude-surfaceHover">
              {marketplaceCount}
            </span>
          )}
          <div className={tabIndicatorClass('marketplace')} />
        </button>
        <button type="button" onClick={() => setActiveTab('custom')} className={tabClass('custom')}>
          {i18nService.t('mcpCustom')}
          {customCount > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-claude-darkSurfaceHover bg-claude-surfaceHover">
              {customCount}
            </span>
          )}
          <div className={tabIndicatorClass('custom')} />
        </button>
      </div>

      <div>
      {/* ── Tab: Installed ──────────────────────────────── */}
      {activeTab === 'installed' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredInstalled.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-claude-textSecondary dark:text-claude-darkTextSecondary">
              {i18nService.t('mcpNoInstalledServers')}
            </div>
          ) : (
            filteredInstalled.map((server) => {
              const registryEntry = getRegistryEntryForServer(server);
              const installedDescription = getInstalledDescription(server);
              return (
                <McpServerInstanceCard
                  key={server.id}
                  server={server}
                  description={installedDescription}
                  tooltipContent={installedDescription}
                  footerDetail={
                    <>
                      {server.transportType === 'stdio' && server.command && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="min-w-0 truncate">{getStdioCommandSummary(server.command, server.args)}</span>
                        </>
                      )}
                      {(server.transportType === 'sse' || server.transportType === 'http') && server.url && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="min-w-0 truncate">{server.url}</span>
                        </>
                      )}
                      {registryEntry?.requiredEnvKeys && registryEntry.requiredEnvKeys.length > 0 && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="shrink-0 text-amber-600 dark:text-amber-400">
                            {registryEntry.requiredEnvKeys.length} key{registryEntry.requiredEnvKeys.length > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </>
                  }
                  onEdit={() => handleOpenEditForm(server)}
                  onDelete={() => handleRequestDelete(server)}
                  onToggle={() => handleToggleEnabled(server.id)}
                />
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Marketplace ────────────────────────────── */}
      {activeTab === 'marketplace' && (
        <div>
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {dynamicCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-claude-accent text-white'
                    : 'dark:bg-claude-darkSurface bg-claude-surface dark:text-claude-darkTextSecondary text-claude-textSecondary dark:hover:bg-claude-darkSurfaceHover hover:bg-claude-surfaceHover border dark:border-claude-darkBorder border-claude-border'
                }`}
              >
                {(i18nService.getLanguage() === 'zh' ? cat.name_zh : cat.name_en) || i18nService.t(cat.key)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredMarketplace.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-claude-textSecondary dark:text-claude-darkTextSecondary">
                {i18nService.t('noMcpServersAvailable')}
              </div>
            ) : (
              filteredMarketplace.map((entry) => (
                <McpMarketplaceEntryCard
                  key={entry.id}
                  entry={entry}
                  description={getRegistryEntryDescription(entry)}
                  isInstalled={installedRegistryIds.has(entry.id)}
                  categoryLabel={getRegistryCategoryLabel(entry)}
                  footerDetail={
                    <>
                      <span className="opacity-40">·</span>
                      <span className="min-w-0 truncate">{getStdioCommandSummary(entry.command, entry.defaultArgs)}</span>
                      {entry.requiredEnvKeys && entry.requiredEnvKeys.length > 0 && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="shrink-0 text-amber-600 dark:text-amber-400">
                            {entry.requiredEnvKeys.length} key{entry.requiredEnvKeys.length > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </>
                  }
                  onInstall={() => handleInstallFromRegistry(entry)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Custom ─────────────────────────────────── */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {/* Custom servers grid (add button + server cards) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="group relative flex min-h-[168px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/[0.08] bg-gradient-to-b from-transparent to-claude-surface/40 text-sm font-medium text-claude-textSecondary transition-all duration-300 hover:border-claude-accent/45 hover:bg-gradient-to-b hover:from-claude-accent/[0.06] hover:to-claude-surface/50 hover:text-claude-accent dark:border-white/[0.12] dark:to-claude-darkSurface/30 dark:text-claude-darkTextSecondary dark:hover:text-claude-accent"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-lg leading-none opacity-80 group-hover:opacity-100">+</span>
                {i18nService.t('addMcpServer')}
              </span>
            </button>
            {filteredCustom.map((server) => {
              const desc = server.description || getTransportSummary(server);
              return (
                <McpServerInstanceCard
                  key={server.id}
                  server={server}
                  description={desc}
                  tooltipContent={desc}
                  footerDetail={
                    <>
                      {server.transportType === 'stdio' && server.command && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="min-w-0 truncate">{server.command}</span>
                        </>
                      )}
                      {(server.transportType === 'sse' || server.transportType === 'http') && server.url && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="min-w-0 truncate">{server.url}</span>
                        </>
                      )}
                    </>
                  }
                  onEdit={() => handleOpenEditForm(server)}
                  onDelete={() => handleRequestDelete(server)}
                  onToggle={() => handleToggleEnabled(server.id)}
                />
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleCancelDelete}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl dark:bg-claude-darkSurface bg-claude-surface border dark:border-claude-darkBorder border-claude-border shadow-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-semibold dark:text-claude-darkText text-claude-text">
              {i18nService.t('deleteMcpServer')}
            </div>
            <p className="mt-2 text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary">
              {i18nService.t('mcpDeleteConfirm').replace('{name}', pendingDelete.name)}
            </p>
            {actionError && (
              <div className="mt-3 text-xs text-red-500">
                {actionError}
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs rounded-lg border dark:border-claude-darkBorder border-claude-border dark:text-claude-darkTextSecondary text-claude-textSecondary dark:hover:bg-claude-darkSurfaceHover hover:bg-claude-surfaceHover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {i18nService.t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {i18nService.t('confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Registry-install form modal */}
      <McpServerFormModal
        isOpen={isFormOpen}
        server={editingServer}
        registryEntry={installingRegistry}
        existingNames={existingNames}
        onClose={handleCloseForm}
        onSave={handleSaveForm}
      />
    </div>
  );
};

export default McpManager;

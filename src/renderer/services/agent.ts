import { PRESET_AGENT_IDS } from '@shared/presetAgentIds';
import { store } from '../store';
import {
  setAgents,
  setCurrentAgentId,
  setLoading,
  addAgent,
  updateAgent as updateAgentAction,
  removeAgent,
} from '../store/slices/agentSlice';
import { setActiveSkillIds, clearActiveSkills } from '../store/slices/skillSlice';
import { clearCurrentSession } from '../store/slices/coworkSlice';
import type { Agent, PresetAgent } from '../types/agent';

class AgentService {
  async loadAgents(): Promise<void> {
    store.dispatch(setLoading(true));
    try {
      const agents = await window.electron?.agents?.list();
      if (agents) {
        store.dispatch(setAgents(agents.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          enabled: a.enabled,
          isDefault: a.isDefault,
          source: a.source,
          skillIds: a.skillIds ?? [],
        }))));
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  async createAgent(request: {
    name: string;
    description?: string;
    systemPrompt?: string;
    identity?: string;
    model?: string;
    icon?: string;
    skillIds?: string[];
  }): Promise<Agent | null> {
    try {
      const agent = await window.electron?.agents?.create(request);
      if (agent) {
        store.dispatch(addAgent({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          icon: agent.icon,
          enabled: agent.enabled,
          isDefault: agent.isDefault,
          source: agent.source,
          skillIds: agent.skillIds ?? [],
        }));
        return agent;
      }
      return null;
    } catch (error) {
      console.error('Failed to create agent:', error);
      return null;
    }
  }

  async updateAgent(id: string, updates: {
    name?: string;
    description?: string;
    systemPrompt?: string;
    identity?: string;
    model?: string;
    icon?: string;
    skillIds?: string[];
    enabled?: boolean;
  }): Promise<Agent | null> {
    try {
      const agent = await window.electron?.agents?.update(id, updates);
      if (agent) {
        store.dispatch(updateAgentAction({
          id: agent.id,
          updates: {
            name: agent.name,
            description: agent.description,
            icon: agent.icon,
            enabled: agent.enabled,
            skillIds: agent.skillIds ?? [],
          },
        }));
        return agent;
      }
      return null;
    } catch (error) {
      console.error('Failed to update agent:', error);
      return null;
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      await window.electron?.agents?.delete(id);
      store.dispatch(removeAgent(id));
      return true;
    } catch (error) {
      console.error('Failed to delete agent:', error);
      return false;
    }
  }

  async getPresets(): Promise<PresetAgent[]> {
    try {
      const presets = await window.electron?.agents?.presets();
      return presets ?? [];
    } catch (error) {
      console.error('Failed to get presets:', error);
      return [];
    }
  }

  /**
   * All built-in presets with install flags (虾池).
   * Uses IPC `agents:presetsCatalog` when available; if the main process is stale
   * (no handler) merges `agents:presets` + Redux agent list — see `buildPresetsCatalogFallback`.
   */
  async getPresetsCatalog(): Promise<PresetAgent[]> {
    try {
      const presets = await window.electron?.agents?.presetsCatalog?.();
      if (Array.isArray(presets) && presets.length > 0) {
        return presets;
      }
    } catch (error) {
      console.warn('[agentService] presetsCatalog IPC failed, using fallback:', error);
    }
    return this.buildPresetsCatalogFallback();
  }

  /** Rebuild catalog without `agents:presetsCatalog` (older or unrestarted main). */
  private async buildPresetsCatalogFallback(): Promise<PresetAgent[]> {
    const uninstalled = await this.getPresets();
    const agents = store.getState().agent.agents;
    const installedPresetIds = new Set(
      agents.filter((a) => a.source === 'preset').map((a) => a.id)
    );
    const out: PresetAgent[] = [];
    for (const id of PRESET_AGENT_IDS) {
      if (installedPresetIds.has(id)) {
        const a = agents.find((x) => x.source === 'preset' && x.id === id);
        if (a) {
          out.push({
            id: a.id,
            name: a.name,
            icon: a.icon,
            description: a.description,
            systemPrompt: '',
            skillIds: a.skillIds ?? [],
            installed: true,
          });
        }
        continue;
      }
      const u = uninstalled.find((p) => p.id === id);
      if (u) {
        out.push({
          ...u,
          installed: false,
        });
      }
    }
    return out;
  }

  async addPreset(presetId: string): Promise<Agent | null> {
    try {
      const agent = await window.electron?.agents?.addPreset(presetId);
      if (agent) {
        store.dispatch(addAgent({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          icon: agent.icon,
          enabled: agent.enabled,
          isDefault: agent.isDefault,
          source: agent.source,
          skillIds: agent.skillIds ?? [],
        }));
        return agent;
      }
      return null;
    } catch (error) {
      console.error('Failed to add preset agent:', error);
      return null;
    }
  }

  switchAgent(agentId: string): void {
    store.dispatch(setCurrentAgentId(agentId));
    store.dispatch(clearCurrentSession());
    const agent = store.getState().agent.agents.find((a) => a.id === agentId);
    if (agent?.skillIds?.length) {
      store.dispatch(setActiveSkillIds(agent.skillIds));
    } else {
      store.dispatch(clearActiveSkills());
    }
  }
}

export const agentService = new AgentService();

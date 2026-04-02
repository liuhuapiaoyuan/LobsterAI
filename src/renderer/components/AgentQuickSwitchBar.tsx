import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { agentService } from '../services/agent';
import { coworkService } from '../services/cowork';
import Tooltip from './ui/Tooltip';

export interface AgentQuickSwitchBarProps {
  onShowCowork: () => void;
}

/**
 * Horizontal agent avatars for top nav; name + description in tooltip on hover.
 */
const AgentQuickSwitchBar: React.FC<AgentQuickSwitchBarProps> = ({ onShowCowork }) => {
  const agents = useSelector((state: RootState) => state.agent.agents);
  const currentAgentId = useSelector((state: RootState) => state.agent.currentAgentId);

  useEffect(() => {
    agentService.loadAgents();
  }, []);

  const enabledAgents = agents.filter((a) => a.enabled);

  if (enabledAgents.length <= 1 && !enabledAgents.some((a) => a.source === 'preset')) {
    return null;
  }

  const handleSwitch = (agentId: string) => {
    if (agentId === currentAgentId) return;
    agentService.switchAgent(agentId);
    coworkService.loadSessions(agentId);
    onShowCowork();
  };

  return (
    <div className="non-draggable flex max-w-[min(280px,42vw)] items-center gap-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {enabledAgents.map((agent) => {
        const isActive = currentAgentId === agent.id;
        const desc = agent.description?.trim();
        return (
          <Tooltip
            key={agent.id}
            position="bottom"
            maxWidth="min(320px,90vw)"
            content={
              <div className="space-y-1">
                <div className="font-semibold leading-snug">{agent.name ==='main'?"默认":agent.name}</div>
                {desc ? (
                  <p className="text-xs leading-relaxed opacity-90">{desc}</p>
                ) : null}
              </div>
            }
          >
            <button
              type="button"
              onClick={() => handleSwitch(agent.id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base leading-none transition-colors ${
                isActive
                  ? 'bg-claude-accent/50 text-background ring-1 ring-claude-accent/25'
                  : 'dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover/90 dark:hover:bg-claude-darkSurfaceHover/80'
              }`}
              aria-label={agent.name}
              aria-pressed={isActive}
            >
              <span aria-hidden>{agent.icon || '🦞'}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default AgentQuickSwitchBar;

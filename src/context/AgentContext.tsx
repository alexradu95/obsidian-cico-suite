import { createContext, useContext } from 'react';
import { Agent } from '../types/agent';
import { AgentService } from '../services/AgentService';

/**
 * Type definition for the AgentContext value.
 * Provides access to agent service and agent state throughout React components.
 *
 * @interface AgentContextType
 * @property {AgentService} agentService - The agent service instance
 * @property {string | null} activeAgentId - ID of the currently active agent
 * @property {(id: string | null) => void} setActiveAgentId - Function to set active agent
 * @property {Agent[]} agents - Array of all registered agents
 * @property {(agents: Agent[]) => void} setAgents - Function to update agents array
 */
export interface AgentContextType {
	agentService: AgentService;
	activeAgentId: string | null;
	setActiveAgentId: (id: string | null) => void;
	agents: Agent[];
	setAgents: (agents: Agent[]) => void;
}

/**
 * React Context for sharing agent service and state.
 * Allows React components to access agent functionality through the useAgents hook.
 *
 * @const {React.Context<AgentContextType | undefined>}
 * @example
 * // Providing context
 * <AgentContext.Provider value={{ agentService, activeAgentId, setActiveAgentId, agents, setAgents }}>
 *   <MultiAgentView />
 * </AgentContext.Provider>
 *
 * // Consuming context via useAgents hook
 * const { agentService, activeAgentId, agents } = useAgents();
 */
export const AgentContext = createContext<AgentContextType | undefined>(undefined);

/**
 * Custom React hook for accessing the agent service and state.
 * Must be used within an AgentContext.Provider component.
 *
 * @hook
 * @returns {AgentContextType} Object containing agent service and state
 * @throws {Error} If used outside of AgentContext.Provider
 * @example
 * const { agentService, activeAgentId, agents } = useAgents();
 * const currentAgent = agents.find(a => a.id === activeAgentId);
 */
export const useAgents = (): AgentContextType => {
	const context = useContext(AgentContext);
	if (!context) {
		throw new Error('useAgents must be used within AgentContext.Provider');
	}
	return context;
};
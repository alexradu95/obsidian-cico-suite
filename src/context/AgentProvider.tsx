import * as React from 'react';
import { AgentContext } from './AgentContext';
import { AgentService } from '../services/AgentService';
import { Agent } from '../types/agent';

/**
 * Props for the AgentProvider component
 */
export interface AgentProviderProps {
	/** The agent service instance */
	agentService: AgentService;
	/** Optional initial agents to register */
	initialAgents?: Agent[];
	/** Child components */
	children: React.ReactNode;
}

/**
 * Provider component that wraps the AgentContext and manages agent state
 */
export const AgentProvider = (props: AgentProviderProps) => {
	const { agentService, initialAgents, children } = props;
	const [activeAgentId, setActiveAgentId] = React.useState<string | null>(null);
	const [agents, setAgents] = React.useState<Agent[]>([]);

	// Register initial agents on mount
	React.useEffect(() => {
		if (initialAgents && initialAgents.length > 0) {
			initialAgents.forEach(agent => {
				try {
					agentService.registerAgent(agent);
				} catch (error) {
					// Agent might already be registered, ignore
					console.warn(`Failed to register agent ${agent.id}:`, error);
				}
			});
			setAgents(initialAgents);
		}
	}, []); // Empty deps array - only run on mount

	const contextValue = {
		agentService,
		activeAgentId,
		setActiveAgentId,
		agents,
		setAgents
	};

	return (
		<AgentContext.Provider value={contextValue}>
			{children}
		</AgentContext.Provider>
	);
};
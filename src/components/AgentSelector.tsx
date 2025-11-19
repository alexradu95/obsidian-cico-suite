import * as React from 'react';
import { Agent } from '../types/agent';

/**
 * Props for the AgentSelector component
 */
export interface AgentSelectorProps {
	/** Array of available agents */
	agents: Agent[];
	/** ID of the currently active agent */
	activeAgentId: string | null;
	/** Callback when an agent is selected */
	onSelectAgent: (agentId: string) => void;
}

/**
 * Component for selecting between multiple agents
 */
export const AgentSelector = (props: AgentSelectorProps) => {
	const { agents, activeAgentId, onSelectAgent } = props;
	const handleAgentClick = (agentId: string) => {
		if (agentId === activeAgentId) {
			return;
		}
		onSelectAgent(agentId);
	};

	if (agents.length === 0) {
		return (
			<div className="agent-selector-empty">
				No agents available
			</div>
		);
	}

	return (
		<div className="agent-selector">
			{agents.map(agent => (
				<button
					key={agent.id}
					className={`agent-selector-item ${agent.id === activeAgentId ? 'active' : ''}`}
					onClick={() => handleAgentClick(agent.id)}
				>
					<span className="agent-name">{agent.name}</span>
					<span className="agent-role-badge">{agent.role}</span>
				</button>
			))}
		</div>
	);
};
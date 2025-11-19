import * as React from 'react';
import { useApp } from '../hooks/useApp';
import { AgentMode } from '../types';
import { AIAssistantView } from './AIAssistantView';
import { AgentProvider } from '../context/AgentProvider';
import { useAgents } from '../context/AgentContext';
import { AgentSelector } from './AgentSelector';
import { MultiAgentChatView } from './MultiAgentChatView';
import { Agent, AgentMessage } from '../types/agent';
import { ensureAtLeastOneAgent } from '../utils/agentHelpers';

/**
 * Wrapper component that renders either single-agent or multi-agent view
 * based on the current agent mode setting
 */
export const AssistantViewWrapper = () => {
	const { plugin } = useApp();
	const { settings, agentService } = plugin;
	const agentMode = settings.agentMode || AgentMode.SINGLE;

	// Single-agent mode - render traditional view
	if (agentMode === AgentMode.SINGLE) {
		return <AIAssistantView />;
	}

	// Multi-agent mode - ensure we have at least one agent
	const agents = React.useMemo(() => {
		const ensuredAgents = ensureAtLeastOneAgent(settings.agents);

		// Persist agents if they were just created
		if (!settings.agents || settings.agents.length === 0) {
			plugin.settings.agents = ensuredAgents;
			plugin.saveSettings().catch(console.error);
		}

		return ensuredAgents;
	}, [settings.agents, plugin]);

	// Multi-agent mode - render new multi-agent interface
	return (
		<MultiAgentAssistantView
			agentService={agentService}
			initialAgents={agents}
		/>
	);
};

/**
 * Props for MultiAgentAssistantView
 */
interface MultiAgentAssistantViewProps {
	agentService: any;
	initialAgents: Agent[];
}

/**
 * Multi-agent assistant view component
 */
const MultiAgentAssistantView = (props: MultiAgentAssistantViewProps) => {
	const { agentService, initialAgents } = props;

	return (
		<AgentProvider agentService={agentService} initialAgents={initialAgents}>
			<MultiAgentContent />
		</AgentProvider>
	);
};

/**
 * Inner component that has access to AgentContext
 */
const MultiAgentContent = () => {
	const { agents, activeAgentId, setActiveAgentId, agentService } = useAgents();
	const [messages, setMessages] = React.useState<AgentMessage[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	// Select first agent by default if none selected
	React.useEffect(() => {
		if (!activeAgentId && agents.length > 0) {
			setActiveAgentId(agents[0].id);
		}
	}, [agents, activeAgentId, setActiveAgentId]);

	const handleSendMessage = async (content: string, agentId: string) => {
		const newMessage: AgentMessage = {
			id: `msg-${Date.now()}`,
			role: 'user',
			content,
			agentId,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, newMessage]);
		setIsLoading(true);

		try {
			const response = await agentService.processMessage(newMessage);

			const assistantMessage: AgentMessage = {
				id: `msg-${Date.now()}-response`,
				role: 'assistant',
				content: response,
				agentId,
				timestamp: new Date()
			};

			setMessages(prev => [...prev, assistantMessage]);
		} catch (error: any) {
			console.error('Error processing message:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="multi-agent-assistant-view" data-testid="multi-agent-view">
			<AgentSelector
				agents={agents}
				activeAgentId={activeAgentId}
				onSelectAgent={setActiveAgentId}
			/>
			<MultiAgentChatView
				messages={messages}
				activeAgentId={activeAgentId}
				onSendMessage={handleSendMessage}
				isLoading={isLoading}
			/>
		</div>
	);
};
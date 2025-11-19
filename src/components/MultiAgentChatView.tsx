import * as React from 'react';
import { AgentMessage } from '../types/agent';

/**
 * Props for the MultiAgentChatView component
 */
export interface MultiAgentChatViewProps {
	/** Array of messages to display */
	messages: AgentMessage[];
	/** ID of the currently active agent (null shows all messages) */
	activeAgentId: string | null;
	/** Callback when user sends a message */
	onSendMessage: (content: string, agentId: string) => void;
	/** Whether the chat is currently loading */
	isLoading: boolean;
}

/**
 * Component for displaying and managing multi-agent conversations
 */
export const MultiAgentChatView = (props: MultiAgentChatViewProps) => {
	const { messages, activeAgentId, onSendMessage, isLoading } = props;
	const [inputValue, setInputValue] = React.useState('');

	const filteredMessages = activeAgentId
		? messages.filter((msg: AgentMessage) => msg.agentId === activeAgentId)
		: messages;

	const handleSendMessage = () => {
		const trimmedValue = inputValue.trim();
		if (!trimmedValue || !activeAgentId) {
			return;
		}

		onSendMessage(trimmedValue, activeAgentId);
		setInputValue('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="multi-agent-chat-view">
			<div className="messages-container">
				{isLoading && (
					<div className="loading-indicator">Loading...</div>
				)}

				{!isLoading && filteredMessages.length === 0 && (
					<div className="empty-state">No messages yet</div>
				)}

				{filteredMessages.map((message: AgentMessage) => (
					<div
						key={message.id}
						className={`message ${message.role}`}
					>
						<div className="message-content">{message.content}</div>
					</div>
				))}
			</div>

			<div className="input-container">
				<input
					type="text"
					className="message-input"
					placeholder="Type your message..."
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
				/>
				<button
					className="send-button"
					onClick={handleSendMessage}
					disabled={isLoading}
				>
					Send
				</button>
			</div>
		</div>
	);
};
import { AIAssistantView } from './AIAssistantView';

interface SidebarViewProps {
	onUnpin: () => void;
}

export const SidebarView = ({ onUnpin }: SidebarViewProps) => {
	return (
		<div className="ai-assistant-sidebar">
			<div className="ai-assistant-header">
				<div className="ai-assistant-title">
					<span>🤖 AI Assistant</span>
				</div>
				<div className="ai-assistant-controls">
					<button aria-label="Unpin to floating" onClick={onUnpin}>
						📌
					</button>
				</div>
			</div>
			<div className="ai-assistant-body">
				<AIAssistantView />
			</div>
		</div>
	);
};

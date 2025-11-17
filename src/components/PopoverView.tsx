import { useState } from 'react';
import { AIAssistantView } from './AIAssistantView';

interface PopoverViewProps {
	onClose: () => void;
	onPin: () => void;
	onMinimize: () => void;
}

export const PopoverView = ({ onClose, onPin, onMinimize }: PopoverViewProps) => {
	const [isMinimized, setIsMinimized] = useState(false);

	const handleMinimize = () => {
		setIsMinimized(!isMinimized);
		onMinimize();
	};

	return (
		<div className={`ai-assistant-popover ${isMinimized ? 'minimized' : ''}`}>
			<div className="ai-assistant-header">
				<div className="ai-assistant-title">
					<span>🤖 AI Assistant</span>
				</div>
				<div className="ai-assistant-controls">
					<button aria-label="Pin to sidebar" onClick={onPin}>
						📌
					</button>
					<button onClick={handleMinimize}>−</button>
					<button onClick={onClose}>×</button>
				</div>
			</div>
			<div className="ai-assistant-body">
				<AIAssistantView />
			</div>
		</div>
	);
};

import { AIAssistantView } from './AIAssistantView';

/**
 * Sidebar view component for the AI Assistant.
 * Renders the assistant in Obsidian's sidebar.
 * Provides an integrated experience within the Obsidian workspace.
 *
 * @component
 * @returns {JSX.Element} The rendered sidebar view
 * @example
 * <SidebarView />
 */
export const SidebarView = () => {
	return (
		<div className="ai-assistant-sidebar">
			<AIAssistantView />
		</div>
	);
};
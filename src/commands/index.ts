import type DailyAIAssistantPlugin from '../main';

/**
 * Registers all available commands for the Daily AI Assistant plugin.
 * Commands are actions that users can trigger via the Command Palette (Ctrl/Cmd+P)
 * or bind to hotkeys in Obsidian settings.
 *
 * @param {DailyAIAssistantPlugin} plugin - The plugin instance to register commands with
 * @example
 * // Called during plugin initialization
 * registerCommands(this);
 */
export function registerCommands(plugin: DailyAIAssistantPlugin) {
	plugin.addCommand({
		id: 'toggle-ai-assistant',
		name: 'Toggle AI Assistant',
		callback: () => toggleAssistant(plugin)
	});
}

/**
 * Toggles the visibility of the AI Assistant sidebar panel.
 * Attaches or detaches the sidebar panel based on current state.
 *
 * @param {DailyAIAssistantPlugin} plugin - The plugin instance containing the assistant state
 * @see showAssistant - Called when assistant needs to be shown
 * @example
 * // Usually triggered via command palette or hotkey
 * toggleAssistant(plugin);
 */
export function toggleAssistant(plugin: DailyAIAssistantPlugin) {
	const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
	if (leaves.length > 0) {
		leaves.forEach(leaf => leaf.detach());
	} else {
		showAssistant(plugin);
	}
}

/**
 * Shows the AI Assistant in the sidebar.
 * Creates a sidebar panel if none exists.
 *
 * @param {DailyAIAssistantPlugin} plugin - The plugin instance to show the assistant for
 * @example
 * // Show assistant when user triggers a command
 * showAssistant(plugin);
 */
export async function showAssistant(plugin: DailyAIAssistantPlugin) {
	const { workspace } = plugin.app;
	let leaf = workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT)[0];

	if (!leaf) {
		const rightLeaf = workspace.getRightLeaf(false);
		if (rightLeaf) {
			await rightLeaf.setViewState({ type: plugin.VIEW_TYPE_AI_ASSISTANT, active: true });
			leaf = rightLeaf;
		}
	}

	if (leaf) {
		workspace.revealLeaf(leaf);
	}
}

/**
 * Checks if the AI Assistant is currently visible.
 * Returns true if a sidebar leaf is active.
 *
 * @param {DailyAIAssistantPlugin} plugin - The plugin instance to check visibility for
 * @returns {boolean} True if the assistant is visible, false otherwise
 * @example
 * // Check before toggling visibility
 * if (isAssistantVisible(plugin)) {
 *   console.log('Assistant is currently visible');
 * }
 */
export function isAssistantVisible(plugin: DailyAIAssistantPlugin): boolean {
	const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
	return leaves.length > 0;
}
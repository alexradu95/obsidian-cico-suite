import type DailyAIAssistantPlugin from '../main';

export function registerCommands(plugin: DailyAIAssistantPlugin) {
	plugin.addCommand({
		id: 'toggle-ai-assistant',
		name: 'Toggle AI Assistant',
		callback: () => toggleAssistant(plugin)
	});

	plugin.addCommand({
		id: 'toggle-assistant-mode',
		name: 'Toggle Between Floating/Sidebar Mode',
		callback: () => toggleMode(plugin)
	});
}

export function toggleAssistant(plugin: DailyAIAssistantPlugin) {
	if (plugin.currentMode === 'floating') {
		if (plugin.floatingPopover?.isVisible()) {
			plugin.floatingPopover.hide();
		} else {
			showAssistant(plugin);
		}
	} else {
		const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
		if (leaves.length > 0) {
			leaves.forEach(leaf => leaf.detach());
		} else {
			showAssistant(plugin);
		}
	}
}

async function toggleMode(plugin: DailyAIAssistantPlugin) {
	if (plugin.currentMode === 'floating') {
		await switchToSidebar(plugin);
	} else {
		await switchToFloating(plugin);
	}
}

export async function switchToSidebar(plugin: DailyAIAssistantPlugin) {
	if (plugin.floatingPopover) {
		plugin.floatingPopover.hide();
	}

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

	plugin.currentMode = 'sidebar';
}

export async function switchToFloating(plugin: DailyAIAssistantPlugin) {
	const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
	leaves.forEach(leaf => leaf.detach());

	if (!plugin.floatingPopover) {
		const { AIAssistantPopover } = await import('../ui/views/PopoverView');
		plugin.floatingPopover = new AIAssistantPopover(plugin);
	}
	plugin.floatingPopover.show();

	plugin.currentMode = 'floating';
}

export function showAssistant(plugin: DailyAIAssistantPlugin) {
	if (plugin.currentMode === 'floating') {
		if (!plugin.floatingPopover) {
			import('../ui/views/PopoverView').then(({ AIAssistantPopover }) => {
				plugin.floatingPopover = new AIAssistantPopover(plugin);
				plugin.floatingPopover.show();
			});
		} else {
			plugin.floatingPopover.show();
		}
	} else {
		const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
		if (leaves.length === 0) {
			switchToSidebar(plugin);
		}
	}
}

export function isAssistantVisible(plugin: DailyAIAssistantPlugin): boolean {
	const leaves = plugin.app.workspace.getLeavesOfType(plugin.VIEW_TYPE_AI_ASSISTANT);
	if (leaves.length > 0) return true;
	if (plugin.floatingPopover?.isVisible()) return true;
	return false;
}

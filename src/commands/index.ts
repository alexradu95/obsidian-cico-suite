import type DailyAIAssistantPlugin from '../main';
import { FLOW_CANVAS_VIEW_TYPE } from '../views/FlowCanvasView';
import type { FlowCanvasView } from '../views/FlowCanvasView';

/**
 * Registers all available commands for the AI Canvas Workflows plugin.
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
		id: 'create-agent-canvas',
		name: 'Create/Open AI Canvas',
		callback: async () => {
			await createAgentCanvas(plugin);
		}
	});

	plugin.addCommand({
		id: 'add-default-assistant-to-canvas',
		name: 'Add Default Assistant to Canvas',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (activeFile && activeFile.extension === 'canvas') {
				if (!checking) {
					addDefaultAssistantToCanvas(plugin, activeFile);
				}
				return true;
			}
			return false;
		}
	});

	plugin.addCommand({
		id: 'process-ai-node',
		name: 'Process AI Node in Canvas',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (activeFile && activeFile.extension === 'canvas') {
				if (!checking) {
					processAINode(plugin, activeFile);
				}
				return true;
			}
			return false;
		}
	});

	plugin.addCommand({
		id: 'open-canvas-in-flow-view',
		name: 'Open Canvas in Flow View',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (activeFile && activeFile.extension === 'canvas') {
				if (!checking) {
					openCanvasInFlowView(plugin, activeFile);
				}
				return true;
			}
			return false;
		}
	});
}

/**
 * Creates or opens an agent canvas file for multi-agent workflows
 *
 * @param {DailyAIAssistantPlugin} plugin - The plugin instance
 * @example
 * // Create a new agent canvas
 * await createAgentCanvas(plugin);
 */
export async function createAgentCanvas(plugin: DailyAIAssistantPlugin): Promise<void> {
	const { canvasService, settings } = plugin;

	// Generate filename based on current date or use a default
	const now = new Date();
	const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	const canvasPath = `Agent Canvas/agent-canvas-${dateStr}`;

	try {
		const file = await canvasService.createOrOpenAgentCanvas(canvasPath);

		// Read current canvas data
		const canvasData = await canvasService.readCanvas(file);

		// If canvas is empty, add default assistant
		if (canvasData.nodes?.length === 0) {
			await canvasService.addDefaultAssistant(file);

			// Also add configured agents if any
			if (settings.agents && settings.agents.length > 0) {
				for (let i = 0; i < settings.agents.length; i++) {
					const agent = settings.agents[i];
					await canvasService.addAgentNode(file, agent, { x: 100, y: 300 + i * 250 });
				}
			}
		}

		// Open the canvas
		await canvasService.openCanvas(file);
	} catch (error) {
		console.error('Error creating agent canvas:', error);
	}
}

/**
 * Adds the default assistant to the currently active canvas
 */
async function addDefaultAssistantToCanvas(plugin: DailyAIAssistantPlugin, file: import('obsidian').TFile): Promise<void> {
	try {
		await plugin.canvasService.addDefaultAssistant(file);
		console.log('Added default assistant to canvas');
	} catch (error) {
		console.error('Error adding default assistant:', error);
	}
}

/**
 * Processes an AI node in the currently active canvas
 */
async function processAINode(plugin: DailyAIAssistantPlugin, file: import('obsidian').TFile): Promise<void> {
	const { aiProcessingService, canvasService, app } = plugin;

	try {
		// Get all nodes from the canvas
		const canvasData = await canvasService.readCanvas(file);

		// Find AI processing nodes (nodes with "AI Processing Node" in their content)
		const aiProcessingNodes = canvasData.nodes?.filter(node => {
			if (node.type !== 'text') return false;
			const textNode = node as import('../types/jsoncanvas').JSONCanvasTextNode;
			return textNode.text.includes('**AI Processing Node**');
		});

		if (!aiProcessingNodes || aiProcessingNodes.length === 0) {
			app.vault.adapter.write(
				'temp-notice.txt',
				'No AI processing nodes found. Create one using the canvas editor.'
			);
			return;
		}

		// If there's only one, process it. Otherwise, ask the user to select
		if (aiProcessingNodes.length === 1) {
			await aiProcessingService.processAINode(file, aiProcessingNodes[0].id);
			console.log('Processed AI node:', aiProcessingNodes[0].id);
		} else {
			// For simplicity, process all AI processing nodes
			for (const node of aiProcessingNodes) {
				try {
					await aiProcessingService.processAINode(file, node.id);
					console.log('Processed AI node:', node.id);
				} catch (error) {
					console.error(`Error processing node ${node.id}:`, error);
				}
			}
		}
	} catch (error) {
		console.error('Error processing AI nodes:', error);
	}
}

/**
 * Opens a canvas file in the Flow Canvas view
 */
export async function openCanvasInFlowView(plugin: DailyAIAssistantPlugin, file: import('obsidian').TFile): Promise<void> {
	try {
		// Get or create a leaf for the Flow Canvas view
		const leaf = plugin.app.workspace.getLeaf('tab');

		// Set the view type to Flow Canvas
		await leaf.setViewState({
			type: FLOW_CANVAS_VIEW_TYPE,
			active: true,
		});

		// Get the view and load the canvas file
		const view = leaf.view;
		if (view && view.getViewType() === FLOW_CANVAS_VIEW_TYPE) {
			await (view as FlowCanvasView).loadCanvas(file);
		}

		// Reveal the leaf
		plugin.app.workspace.revealLeaf(leaf);
	} catch (error) {
		console.error('Error opening canvas in Flow view:', error);
	}
}
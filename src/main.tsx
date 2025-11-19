import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, type DailyAIAssistantSettings } from './types';
import { AIService } from './services/AIService';
import { CanvasService } from './services/CanvasService';
import { AIProcessingService } from './services/AIProcessingService';
import { DailyAIAssistantSettingTab } from './ui/SettingsTab';
import { registerCommands } from './commands';
import { CanvasPatcher } from './patchers/CanvasPatcher';

/**
 * Main plugin class for AI Canvas Workflows.
 * This plugin provides AI-powered canvas workflows for visual multi-agent processing.
 * Create nodes on canvas, connect them, and let AI process the information flow.
 *
 * @extends Plugin
 * @example
 * // Plugin is automatically instantiated by Obsidian
 * // Access via app.plugins.plugins['daily-ai-assistant']
 */
export default class DailyAIAssistantPlugin extends Plugin {
	/** Plugin settings containing user preferences and configuration */
	settings: DailyAIAssistantSettings;
	/** Service instance for handling AI interactions and LM Studio API calls */
	aiService: AIService;
	/** Service instance for managing canvas files */
	canvasService: CanvasService;
	/** Service instance for AI processing workflows on canvas */
	aiProcessingService: AIProcessingService;
	/** Patcher for adding canvas context menu support */
	canvasPatcher: CanvasPatcher;

	/**
	 * Called when the plugin is loaded by Obsidian.
	 * Initializes settings, services, and registers commands for canvas workflows.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async onload() {
		await this.loadSettings();
		this.aiService = new AIService(this.app, this.settings);
		this.canvasService = new CanvasService(this.app);
		this.aiProcessingService = new AIProcessingService(this.canvasService, this.aiService);

		// Initialize canvas patcher for context menus
		this.canvasPatcher = new CanvasPatcher(this);
		this.canvasPatcher.patch();

		// Add ribbon icon for canvas
		this.addRibbonIcon('git-fork', 'Create/Open AI Canvas', async () => {
			const commands = require('./commands');
			await commands.createAgentCanvas(this);
		});

		// Register canvas commands
		registerCommands(this);

		// Register context menu for canvas files in file explorer
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				// Check if it's a TFile and has .canvas extension
				if (file instanceof TFile && file.extension === 'canvas') {
					menu.addItem((item) => {
						item
							.setTitle('Add AI Agent Here')
							.setIcon('bot')
							.onClick(async () => {
								await this.canvasService.addDefaultAssistant(file, this.getCanvasCursorPosition());
							});
					});

					menu.addItem((item) => {
						item
							.setTitle('Add AI Processing Node')
							.setIcon('wand')
							.onClick(async () => {
								const nodeId = `ai-processor-${Date.now()}`;
								await this.canvasService.addAIProcessingNode(
									file,
									nodeId,
									'New Processor',
									'Describe what you want this AI to do with the input.',
									this.getCanvasCursorPosition()
								);
							});
					});

					menu.addItem((item) => {
						item
							.setTitle('Add Output Node')
							.setIcon('file-output')
							.onClick(async () => {
								const nodeId = `output-${Date.now()}`;
								await this.canvasService.addOutputNode(
									file,
									nodeId,
									'Output',
									this.getCanvasCursorPosition()
								);
							});
					});
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new DailyAIAssistantSettingTab(this.app, this));
	}

	onunload(): void {
		// Clean up canvas patcher
		if (this.canvasPatcher) {
			this.canvasPatcher.destroy();
		}
	}

	/**
	 * Gets the current cursor position on the canvas
	 * Returns a default position if cursor position cannot be determined
	 */
	private getCanvasCursorPosition(): { x: number; y: number } {
		// Default position - will be used if we can't get the actual cursor position
		return {
			x: 100 + Math.random() * 200,
			y: 100 + Math.random() * 200
		};
	}

	/**
	 * Loads plugin settings from Obsidian's data storage.
	 * Merges saved settings with defaults to ensure all properties exist.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Saves the current plugin settings to Obsidian's data storage.
	 * Also updates the AIService with the new settings.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.aiService.updateSettings(this.settings);
	}
}
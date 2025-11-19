import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, VIEW_TYPE_AI_ASSISTANT, type DailyAIAssistantSettings, AgentMode } from './types';
import { AIService } from './services/AIService';
import { AgentService } from './services/AgentService';
import { DailyAIAssistantSettingTab } from './ui/SettingsTab';
import { AIAssistantSidebarView } from './ui/views/SidebarView';
import { registerCommands, showAssistant, isAssistantVisible } from './commands';

/**
 * Main plugin class for Daily AI Assistant for Obsidian.
 * This plugin provides an AI-powered assistant that can help with daily notes,
 * document analysis, and general questions. The assistant is displayed in the
 * sidebar panel.
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
	/** Service instance for managing multi-agent interactions */
	agentService: AgentService;
	/** Reference to the sidebar view instance */
	sidebarView: AIAssistantSidebarView | null = null;
	/** View type identifier for registering the sidebar view with Obsidian */
	VIEW_TYPE_AI_ASSISTANT = VIEW_TYPE_AI_ASSISTANT;

	/**
	 * Called when the plugin is loaded by Obsidian.
	 * Initializes settings, services, views, and registers commands.
	 * Sets up event listeners for auto-showing on daily notes.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async onload() {
		await this.loadSettings();
		this.aiService = new AIService(this.app, this.settings);
		this.agentService = new AgentService(this.aiService);

		// Register sidebar view
		this.registerView(
			VIEW_TYPE_AI_ASSISTANT,
			(leaf) => (this.sidebarView = new AIAssistantSidebarView(leaf, this))
		);

		// Add ribbon icon
		this.addRibbonIcon('message-circle', 'Toggle AI Assistant', () => {
			const commands = require('./commands');
			commands.toggleAssistant(this);
		});

		// Register commands
		registerCommands(this);

		// Auto-show on daily notes
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (this.settings.autoShowOnDailyNote && file && this.isDailyNote(file)) {
					if (!isAssistantVisible(this)) {
						showAssistant(this);
					}
				}
			})
		);

		// Add settings tab
		this.addSettingTab(new DailyAIAssistantSettingTab(this.app, this));
	}

	/**
	 * Checks if the given file is a daily note based on plugin settings.
	 * Delegates the check to the AIService which knows the daily note patterns.
	 *
	 * @param {TFile} file - The file to check
	 * @returns {boolean} True if the file is a daily note, false otherwise
	 * @example
	 * // Check if current file is a daily note
	 * const isDaily = plugin.isDailyNote(activeFile);
	 */
	isDailyNote(file: TFile): boolean {
		return this.aiService.isDailyNote(file);
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
	 * @example
	 * // After modifying settings
	 * plugin.settings.apiKey = 'new-key';
	 * await plugin.saveSettings();
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.aiService.updateSettings(this.settings);
	}

	/**
	 * Called when the plugin is unloaded by Obsidian.
	 * Performs cleanup by detaching all sidebar views.
	 * This ensures no resources are left hanging when the plugin is disabled.
	 *
	 * @returns {void}
	 */
	onunload() {
		// Close all sidebar views
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		leaves.forEach(leaf => leaf.detach());
	}
}
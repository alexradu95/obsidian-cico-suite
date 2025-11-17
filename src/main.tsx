import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, VIEW_TYPE_AI_ASSISTANT, type DailyAIAssistantSettings } from './types';
import { AIService } from './services/AIService';
import { DailyAIAssistantSettingTab } from './ui/SettingsTab';
import { AIAssistantSidebarView } from './ui/views/SidebarView';
import type { AIAssistantPopover } from './ui/views/PopoverView';
import { registerCommands, showAssistant, isAssistantVisible } from './commands';

export default class DailyAIAssistantPlugin extends Plugin {
	settings: DailyAIAssistantSettings;
	aiService: AIService;
	floatingPopover: AIAssistantPopover | null = null;
	sidebarView: AIAssistantSidebarView | null = null;
	currentMode: 'floating' | 'sidebar' = 'floating';
	VIEW_TYPE_AI_ASSISTANT = VIEW_TYPE_AI_ASSISTANT;

	async onload() {
		await this.loadSettings();
		this.aiService = new AIService(this.app, this.settings);
		this.currentMode = this.settings.defaultMode;

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

	isDailyNote(file: TFile): boolean {
		return this.aiService.isDailyNote(file);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.aiService.updateSettings(this.settings);
	}

	onunload() {
		// Clean up floating popover
		this.floatingPopover?.destroy();

		// Close all sidebar views
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		leaves.forEach(leaf => leaf.detach());
	}
}

import { App, PluginSettingTab, Setting } from 'obsidian';
import type DailyAIAssistantPlugin from '../main';
import type { PersonalityPreset } from '../types';
import { AgentMode } from '../types';

/**
 * Settings tab for the Daily AI Assistant plugin.
 * Provides UI for configuring all plugin settings including:
 * - LM Studio connection settings
 * - AI model parameters
 * - Daily note behavior
 * - Assistant personality
 *
 * @class DailyAIAssistantSettingTab
 * @extends {PluginSettingTab}
 */
export class DailyAIAssistantSettingTab extends PluginSettingTab {
	/** Reference to the plugin instance */
	plugin: DailyAIAssistantPlugin;

	/**
	 * Creates an instance of the settings tab.
	 *
	 * @param {App} app - The Obsidian app instance
	 * @param {DailyAIAssistantPlugin} plugin - The plugin instance
	 */
	constructor(app: App, plugin: DailyAIAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Renders the settings tab UI.
	 * Creates all setting controls and binds them to plugin settings.
	 *
	 * @returns {void}
	 */
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Daily AI Assistant Settings' });

		// LM Studio settings
		containerEl.createEl('h3', { text: 'LM Studio Connection' });

		new Setting(containerEl)
			.setName('LM Studio URL')
			.setDesc('The URL where LM Studio is running')
			.addText(text => text
				.setPlaceholder('http://localhost:1234/v1')
				.setValue(this.plugin.settings.lmStudioUrl)
				.onChange(async (value) => {
					this.plugin.settings.lmStudioUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model Name')
			.setDesc('Leave empty for auto-detection')
			.addText(text => text
				.setPlaceholder('local-model')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value;
					await this.plugin.saveSettings();
				}));

		// Multi-Agent Mode
		containerEl.createEl('h3', { text: 'Multi-Agent Mode' });

		new Setting(containerEl)
			.setName('Agent Mode')
			.setDesc('Enable multi-agent mode for managing multiple AI assistants')
			.addDropdown(dropdown => dropdown
				.addOption(AgentMode.SINGLE, 'Single Agent - Traditional mode')
				.addOption(AgentMode.MULTI, 'Multi-Agent - Network mode')
				.setValue(this.plugin.settings.agentMode)
				.onChange(async (value: AgentMode) => {
					this.plugin.settings.agentMode = value;
					await this.plugin.saveSettings();
				}));

		// Assistant behavior
		containerEl.createEl('h3', { text: 'Assistant Behavior' });

		new Setting(containerEl)
			.setName('Auto-show on daily note')
			.setDesc('Automatically show assistant when opening a daily note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoShowOnDailyNote)
				.onChange(async (value) => {
					this.plugin.settings.autoShowOnDailyNote = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Assistant Personality')
			.setDesc('Choose how the assistant responds (in Romanian)')
			.addDropdown(dropdown => dropdown
				.addOption('concise', 'Concis - Scurt și direct')
				.addOption('balanced', 'Echilibrat - Prietenos')
				.addOption('reflective', 'Reflectiv - Psiholog AI')
				.addOption('poetic', 'Poetic - Creativ')
				.setValue(this.plugin.settings.personality)
				.onChange(async (value: PersonalityPreset) => {
					this.plugin.settings.personality = value;
					await this.plugin.saveSettings();
				}));


		new Setting(containerEl)
			.setName('Max response tokens')
			.setDesc('Maximum length of AI responses')
			.addSlider(slider => slider
				.setLimits(50, 500, 10)
				.setValue(this.plugin.settings.maxTokens)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxTokens = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Controls creativity (0.0-1.0)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));
	}
}

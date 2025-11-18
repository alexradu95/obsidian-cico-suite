import { App, TFile, requestUrl, moment } from 'obsidian';
import type { Message, DailyAIAssistantSettings } from '../types';

/**
 * Service class for handling AI interactions and LM Studio API communications.
 * Manages context gathering, daily note detection, and chat completions.
 *
 * @class AIService
 * @example
 * const aiService = new AIService(app, settings);
 * const response = await aiService.callLMStudio(messages);
 */
export class AIService {
	/** Obsidian app instance for accessing vault and workspace */
	private app: App;
	/** Current plugin settings */
	private settings: DailyAIAssistantSettings;

	/**
	 * Creates a new AIService instance.
	 *
	 * @param {App} app - Obsidian app instance
	 * @param {DailyAIAssistantSettings} settings - Plugin settings
	 */
	constructor(app: App, settings: DailyAIAssistantSettings) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Updates the service settings with new values.
	 * Called when user changes settings through the settings tab.
	 *
	 * @param {DailyAIAssistantSettings} settings - New settings to apply
	 * @returns {void}
	 */
	updateSettings(settings: DailyAIAssistantSettings) {
		this.settings = settings;
	}

	/**
	 * Checks if a file is a daily note based on the Core Daily Notes plugin settings.
	 * Uses the date format configured in Obsidian's Daily Notes plugin, or falls back
	 * to YYYY-MM-DD if the plugin is not enabled or configured.
	 *
	 * @param {TFile} file - The file to check
	 * @returns {boolean} True if the file matches the daily note pattern
	 * @example
	 * const isDaily = aiService.isDailyNote(file); // true for files matching the configured format
	 */
	isDailyNote(file: TFile): boolean {
		// Try to get the Daily Notes plugin settings
		const dailyNotesPlugin = (this.app as any).internalPlugins?.plugins?.['daily-notes'];

		if (dailyNotesPlugin?.enabled && dailyNotesPlugin.instance) {
			// Get the date format from the Daily Notes plugin settings
			const format = dailyNotesPlugin.instance.options?.format || 'YYYY-MM-DD';

			// Try to parse the filename using the configured format
			// moment will return an invalid date if the format doesn't match
			const parsedDate = moment(file.basename, format, true);
			return parsedDate.isValid();
		}

		// Fallback to default YYYY-MM-DD format if Daily Notes plugin is not available
		const dailyNoteRegex = /^\d{4}-\d{2}-\d{2}$/;
		return dailyNoteRegex.test(file.basename);
	}

	/**
	 * Gathers context from currently open tabs in the workspace.
	 * Returns a formatted string with the first 200 characters from up to 5 open tabs.
	 *
	 * @async
	 * @returns {Promise<string>} Formatted context string from open tabs, or empty string if disabled
	 */
	async getOpenTabsContext(): Promise<string> {
		if (!this.settings.includeOpenTabs) return '';

		const leaves = this.app.workspace.getLeavesOfType('markdown');
		const contexts: string[] = [];

		for (const leaf of leaves.slice(0, 5)) { // Limit to 5 tabs
			const view = leaf.view as any;
			if (view.file) {
				const content = await this.app.vault.read(view.file);
				contexts.push(`📄 ${view.file.basename}:\n${content.substring(0, 200)}`);
			}
		}

		return contexts.length > 0 ? '\n\nTab-uri deschise:\n' + contexts.join('\n\n') : '';
	}

	/**
	 * Retrieves content from previous daily notes for context.
	 * Gets the most recent daily notes up to the configured daysOfContext limit.
	 *
	 * @async
	 * @returns {Promise<string>} Formatted string with summaries of previous daily notes
	 * @example
	 * const context = await aiService.getPreviousDailyNotes();
	 * // Returns: "📅 2024-01-15: [first 300 chars]..."
	 */
	async getPreviousDailyNotes(): Promise<string> {
		const files = this.app.vault.getMarkdownFiles();
		const dailyNotes = files
			.filter(f => this.isDailyNote(f))
			.sort((a, b) => b.basename.localeCompare(a.basename))
			.slice(0, this.settings.daysOfContext);

		const summaries: string[] = [];
		for (const note of dailyNotes) {
			const content = await this.app.vault.read(note);
			const preview = content.substring(0, 300);
			summaries.push(`📅 ${note.basename}: ${preview}`);
		}

		return summaries.join('\n\n');
	}

	/**
	 * Sends a chat completion request to the LM Studio API.
	 * Handles the API communication with configured parameters like temperature and max tokens.
	 *
	 * @async
	 * @param {Message[]} messages - Array of chat messages to send to the AI
	 * @returns {Promise<string>} The AI's response content
	 * @throws {Error} If the API request fails or returns an invalid response
	 * @example
	 * const messages = [
	 *   { role: 'system', content: 'You are a helpful assistant' },
	 *   { role: 'user', content: 'Hello!' }
	 * ];
	 * const response = await aiService.callLMStudio(messages);
	 */
	async callLMStudio(messages: Message[]): Promise<string> {
		const response = await requestUrl({
			url: `${this.settings.lmStudioUrl}/chat/completions`,
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: this.settings.modelName || 'local-model',
				messages: messages,
				temperature: this.settings.temperature,
				max_tokens: this.settings.maxTokens,
				stream: false
			})
		});

		return response.json.choices[0]?.message?.content || '';
	}
}

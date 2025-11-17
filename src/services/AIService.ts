import { App, TFile, requestUrl } from 'obsidian';
import type { Message, DailyAIAssistantSettings } from '../types';

export class AIService {
	private app: App;
	private settings: DailyAIAssistantSettings;

	constructor(app: App, settings: DailyAIAssistantSettings) {
		this.app = app;
		this.settings = settings;
	}

	updateSettings(settings: DailyAIAssistantSettings) {
		this.settings = settings;
	}

	isDailyNote(file: TFile): boolean {
		const dailyNoteRegex = /^\d{4}-\d{2}-\d{2}$/;
		return dailyNoteRegex.test(file.basename);
	}

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

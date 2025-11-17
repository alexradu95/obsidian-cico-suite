import { App, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, ItemView, requestUrl } from 'obsidian';

interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

type PersonalityPreset = 'concise' | 'balanced' | 'reflective' | 'poetic';

interface DailyAIAssistantSettings {
	lmStudioUrl: string;
	modelName: string;
	autoShowOnDailyNote: boolean;
	daysOfContext: number;
	maxTokens: number;
	temperature: number;
	autoAnalyze: boolean;
	personality: PersonalityPreset;
}

const DEFAULT_SETTINGS: DailyAIAssistantSettings = {
	lmStudioUrl: 'http://localhost:1234/v1',
	modelName: '',
	autoShowOnDailyNote: true,
	daysOfContext: 7,
	maxTokens: 150,
	temperature: 0.7,
	autoAnalyze: false,
	personality: 'concise'
}

const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-view';

const PERSONALITY_PROMPTS: Record<PersonalityPreset, string> = {
	concise: `Ești un asistent de jurnal direct și concis. Vorbește în limba română.
Răspunde scurt (1-2 propoziții). Pune o întrebare clară sau fă o observație specifică.
Fără limbaj poetic. Concentrează-te pe: sport/sală, dezvoltare personală, relaxare, obiceiuri zilnice.`,

	balanced: `Ești un asistent de jurnal prietenos și gânditor. Vorbește în limba română.
Oferă observații sau întrebări concise (2-3 propoziții). Fii cald dar nu prea verbos.
Concentrează-te pe: sport/sală (ce ai făcut, cum te-ai simțit), dezvoltare personală (ce ai învățat/lucrat azi),
relaxare (cum te destresezi), și pattern-uri între ziua curentă și zilele anterioare.`,

	reflective: `Ești un asistent de jurnal gânditor, ca un psiholog AI. Vorbește în limba română.
Oferă insight-uri profunde și întrebări semnificative pentru reflecție (3-4 propoziții).
Analizează: exercițiu fizic (ai fost la sală? ce ai făcut? cum te-ai simțit?),
dezvoltare personală (ai învățat ceva nou? ai lucrat la proiecte personale?),
relaxare și auto-îngrijire (cum te-ai destins? ce te-a ajutat?).
Compară cu zilele anterioare pentru a identifica pattern-uri și progress.`,

	poetic: `Ești un asistent de jurnal creativ și expresiv. Vorbește în limba română.
Folosește limbaj viu și metafore pentru a ajuta utilizatorul să reflecteze.
Explorează: exercițiul fizic (sala, mișcarea, cum simte corpul),
dezvoltarea sa (învățare, creștere, proiecte), relaxarea (cum își reîncarcă bateriile).
Fii cald, încurajator, și ajută-l să vadă conexiuni mai profunde între experiențele zilnice.`
};

export default class DailyAIAssistantPlugin extends Plugin {
	settings: DailyAIAssistantSettings;
	assistantView: AIAssistantView | null = null;

	async onload() {
		await this.loadSettings();

		// Register the view
		this.registerView(
			VIEW_TYPE_AI_ASSISTANT,
			(leaf) => (this.assistantView = new AIAssistantView(leaf, this))
		);

		// Add ribbon icon to toggle assistant
		this.addRibbonIcon('message-circle', 'Toggle AI Assistant', () => {
			this.toggleAssistant();
		});

		// Add command to toggle assistant
		this.addCommand({
			id: 'toggle-ai-assistant',
			name: 'Toggle AI Assistant',
			callback: () => {
				this.toggleAssistant();
			}
		});

		// Listen for active leaf changes to analyze current document
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				if (this.settings.autoAnalyze && this.assistantView && this.assistantView.isVisible) {
					this.assistantView.analyzeCurrentDocument();
				}
			})
		);

		// Auto-show on daily notes if enabled
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (this.settings.autoShowOnDailyNote && file) {
					this.checkAndShowForDailyNote(file);
				}
			})
		);

		// Initialize assistant when layout is ready
		this.app.workspace.onLayoutReady(() => {
			this.initAssistant();
		});

		// Add settings tab
		this.addSettingTab(new DailyAIAssistantSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup
		if (this.assistantView) {
			this.assistantView.destroy();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async checkLMStudioConnection(): Promise<boolean> {
		try {
			const response = await requestUrl({
				url: `${this.settings.lmStudioUrl}/models`,
				method: 'GET',
			});
			return response.status === 200;
		} catch (error) {
			return false;
		}
	}

	async getAvailableModels(): Promise<string[]> {
		try {
			const response = await requestUrl({
				url: `${this.settings.lmStudioUrl}/models`,
				method: 'GET',
			});
			if (response.status === 200 && response.json.data) {
				return response.json.data.map((model: {id: string}) => model.id);
			}
			return [];
		} catch (error) {
			console.error('Failed to get models:', error);
			return [];
		}
	}

	private checkAndShowForDailyNote(file: TFile) {
		const dailyNotePattern = /^\d{4}-\d{2}-\d{2}$/;
		if (dailyNotePattern.test(file.basename)) {
			setTimeout(() => {
				if (!this.assistantView?.isVisible) {
					this.showAssistant();
				}
			}, 500);
		}
	}

	async initAssistant() {
		// Create the assistant view in the workspace
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		if (leaves.length === 0) {
			// Don't show by default, just register it
			// User can toggle it with ribbon icon or command
		}
	}

	async showAssistant() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		if (leaves.length === 0) {
			// Create new leaf in the root
			const leaf = this.app.workspace.getLeaf('split');
			await leaf.setViewState({
				type: VIEW_TYPE_AI_ASSISTANT,
				active: true,
			});
		}
		if (this.assistantView) {
			this.assistantView.show();
		}
	}

	async hideAssistant() {
		if (this.assistantView) {
			this.assistantView.hide();
		}
	}

	async toggleAssistant() {
		if (this.assistantView?.isVisible) {
			this.hideAssistant();
		} else {
			this.showAssistant();
		}
	}

	async getPreviousDailyNotes(): Promise<string> {
		const files = this.app.vault.getMarkdownFiles();
		const dailyNotePattern = /^\d{4}-\d{2}-\d{2}$/;
		const dailyNotes = files
			.filter(file => dailyNotePattern.test(file.basename))
			.sort((a, b) => b.basename.localeCompare(a.basename))
			.slice(0, this.settings.daysOfContext);

		if (dailyNotes.length === 0) {
			return "No previous daily notes found.";
		}

		let context = "";
		for (const note of dailyNotes) {
			const content = await this.app.vault.read(note);
			const summary = content.substring(0, 300).replace(/\n/g, ' ');
			context += `\n[${note.basename}]: ${summary}...`;
		}
		return context;
	}

	async callLMStudio(messages: Message[]): Promise<string> {
		try {
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

			if (response.status === 200) {
				return response.json.choices[0]?.message?.content || '';
			} else {
				throw new Error(`LM Studio returned status ${response.status}`);
			}
		} catch (error) {
			console.error('LM Studio API error:', error);
			throw new Error('Failed to connect to LM Studio. Make sure it\'s running and a model is loaded.');
		}
	}
}

class AIAssistantView extends ItemView {
	plugin: DailyAIAssistantPlugin;
	containerEl: HTMLElement;
	isVisible = false;
	isMinimized = false;
	isAnalyzing = false;

	chatHistory: Message[] = [];
	conversationEl: HTMLElement;
	inputEl: HTMLTextAreaElement;
	sendButton: HTMLButtonElement;
	statusEl: HTMLElement;
	headerEl: HTMLElement;
	bodyEl: HTMLElement;

	currentFile: TFile | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: DailyAIAssistantPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_AI_ASSISTANT;
	}

	getDisplayText(): string {
		return 'AI Assistant';
	}

	getIcon(): string {
		return 'message-circle';
	}

	async onOpen() {
		this.containerEl = this.contentEl;
		this.containerEl.empty();
		this.containerEl.addClass('ai-assistant-container');

		this.buildUI();
		this.show(); // Show by default when panel opens
	}

	buildUI() {
		// Header with title and controls
		this.headerEl = this.containerEl.createDiv('ai-assistant-header');

		const titleEl = this.headerEl.createDiv('ai-assistant-title');
		titleEl.createSpan({ text: '🤖', cls: 'ai-assistant-icon' });
		titleEl.createSpan({ text: 'AI Assistant', cls: 'ai-assistant-title-text' });

		const controlsEl = this.headerEl.createDiv('ai-assistant-controls');

		const minimizeBtn = controlsEl.createEl('button', { text: '−', cls: 'ai-assistant-btn-minimize' });
		minimizeBtn.onclick = () => this.toggleMinimize();

		// Body (can be minimized)
		this.bodyEl = this.containerEl.createDiv('ai-assistant-body');

		// Status indicator
		this.statusEl = this.bodyEl.createDiv('ai-status-indicator');

		// Conversation area
		this.conversationEl = this.bodyEl.createDiv('ai-conversation-area');

		// Input area
		const inputContainer = this.bodyEl.createDiv('ai-input-container');

		this.inputEl = inputContainer.createEl('textarea', {
			placeholder: 'Ask me anything...',
			attr: { rows: '2' }
		});

		this.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		const buttonContainer = inputContainer.createDiv('ai-button-container');

		this.sendButton = buttonContainer.createEl('button', { text: 'Send', cls: 'ai-btn-send' });
		this.sendButton.onclick = () => this.sendMessage();

		const analyzeBtn = buttonContainer.createEl('button', { text: 'Analyze Doc', cls: 'ai-btn-analyze' });
		analyzeBtn.onclick = () => this.analyzeCurrentDocument();

		// Initial greeting
		this.addMessage('assistant', 'Hi! I\'m your AI assistant. I can help you reflect on your day or analyze your current document. What would you like to talk about?');
	}

	show() {
		this.containerEl.style.display = 'flex';
		this.isVisible = true;
	}

	hide() {
		this.containerEl.style.display = 'none';
		this.isVisible = false;
	}

	toggleMinimize() {
		this.isMinimized = !this.isMinimized;
		if (this.isMinimized) {
			this.bodyEl.style.display = 'none';
			this.containerEl.addClass('minimized');
		} else {
			this.bodyEl.style.display = 'flex';
			this.containerEl.removeClass('minimized');
		}
	}

	async analyzeCurrentDocument() {
		if (this.isAnalyzing) return;

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			this.showStatus('No document open', 'error');
			return;
		}

		this.currentFile = activeFile;
		this.isAnalyzing = true;
		this.showStatus('Analyzing document...', 'loading');

		try {
			const content = await this.app.vault.read(activeFile);

			// Check if document has enough content to analyze
			const minContentLength = 50; // Minimum 50 characters
			if (content.trim().length < minContentLength) {
				this.hideStatus();
				this.addMessage('system', 'Document is too short to analyze. Write something first, then click "Analyze Document" for insights!');
				this.isAnalyzing = false;
				return;
			}

			const previousContext = await this.plugin.getPreviousDailyNotes();
			const personalityPrompt = PERSONALITY_PROMPTS[this.plugin.settings.personality];

			// Create analysis prompt
			const analysisPrompt: Message = {
				role: 'system',
				content: `${personalityPrompt}

Analyze the current document and provide observations or questions to help the user reflect.

Current document: ${activeFile.basename}
Content: ${content.substring(0, 1000)}

Previous daily notes context:
${previousContext}`
			};

			this.chatHistory = [analysisPrompt];

			const insight = await this.plugin.callLMStudio([analysisPrompt]);

			this.hideStatus();
			this.addMessage('assistant', insight);
			this.chatHistory.push({ role: 'assistant', content: insight });

		} catch (error) {
			this.showStatus('Failed to analyze: ' + error.message, 'error');
		} finally {
			this.isAnalyzing = false;
		}
	}

	async sendMessage() {
		const message = this.inputEl.value.trim();
		if (!message) return;

		this.inputEl.disabled = true;
		this.sendButton.disabled = true;

		// Add user message
		this.chatHistory.push({ role: 'user', content: message });
		this.addMessage('user', message);
		this.inputEl.value = '';

		// Show thinking
		const thinkingEl = this.conversationEl.createDiv('ai-message ai-message-assistant ai-message-thinking');
		thinkingEl.setText('🤔 Thinking...');

		try {
			const response = await this.plugin.callLMStudio(this.chatHistory);
			thinkingEl.remove();

			this.chatHistory.push({ role: 'assistant', content: response });
			this.addMessage('assistant', response);
		} catch (error) {
			thinkingEl.remove();
			this.addMessage('system', 'Error: ' + error.message);
			this.showStatus('Error: ' + error.message, 'error');
		}

		this.inputEl.disabled = false;
		this.sendButton.disabled = false;
		this.inputEl.focus();
	}

	addMessage(role: string, content: string) {
		const messageEl = this.conversationEl.createDiv(`ai-message ai-message-${role}`);

		const icon = messageEl.createSpan('ai-message-icon');
		if (role === 'assistant') icon.setText('🤖');
		else if (role === 'user') icon.setText('👤');
		else icon.setText('ℹ️');

		const contentSpan = messageEl.createSpan('ai-message-content');
		contentSpan.setText(content);

		this.conversationEl.scrollTop = this.conversationEl.scrollHeight;
	}

	showStatus(text: string, type: 'loading' | 'success' | 'error') {
		this.statusEl.setText(text);
		this.statusEl.className = `ai-status-indicator ai-status-${type}`;
		this.statusEl.style.display = 'block';
	}

	hideStatus() {
		this.statusEl.style.display = 'none';
	}

	destroy() {
		this.containerEl.remove();
	}

	async onClose() {
		this.destroy();
	}
}

class DailyAIAssistantSettingTab extends PluginSettingTab {
	plugin: DailyAIAssistantPlugin;

	constructor(app: App, plugin: DailyAIAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Daily AI Assistant Settings' });

		// LM Studio connection
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
			.setName('Test Connection')
			.setDesc('Check if LM Studio is running and accessible')
			.addButton(button => button
				.setButtonText('Test Connection')
				.onClick(async () => {
					button.setDisabled(true);
					button.setButtonText('Testing...');
					const isConnected = await this.plugin.checkLMStudioConnection();
					if (isConnected) {
						new Notice('✓ Successfully connected to LM Studio!');
						const models = await this.plugin.getAvailableModels();
						if (models.length > 0) {
							new Notice(`Found ${models.length} model(s)`);
							if (!this.plugin.settings.modelName) {
								this.plugin.settings.modelName = models[0];
								await this.plugin.saveSettings();
								this.display();
							}
						}
					} else {
						new Notice('✗ Cannot connect to LM Studio');
					}
					button.setDisabled(false);
					button.setButtonText('Test Connection');
				}));

		new Setting(containerEl)
			.setName('Model Name')
			.setDesc('The model identifier (auto-detected if left empty)')
			.addText(text => text
				.setPlaceholder('local-model')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value;
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
			.setName('Auto-analyze documents')
			.setDesc('Automatically analyze when switching to a new document')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoAnalyze)
				.onChange(async (value) => {
					this.plugin.settings.autoAnalyze = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Assistant Personality')
			.setDesc('Choose how the assistant responds (in Romanian). Focuses on: gym/sports, personal development, relaxation, daily habits.')
			.addDropdown(dropdown => dropdown
				.addOption('concise', 'Concis - Scurt și direct (1-2 propoziții)')
				.addOption('balanced', 'Echilibrat - Prietenos și gânditor (2-3 propoziții)')
				.addOption('reflective', 'Reflectiv - Psiholog AI, insight-uri profunde (3-4 propoziții)')
				.addOption('poetic', 'Poetic - Creativ și expresiv')
				.setValue(this.plugin.settings.personality)
				.onChange(async (value: PersonalityPreset) => {
					this.plugin.settings.personality = value;
					await this.plugin.saveSettings();
				}));

		// Conversation settings
		containerEl.createEl('h3', { text: 'Conversation Settings' });

		new Setting(containerEl)
			.setName('Days of context')
			.setDesc('Number of previous daily notes to consider')
			.addSlider(slider => slider
				.setLimits(1, 14, 1)
				.setValue(this.plugin.settings.daysOfContext)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.daysOfContext = value;
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
			.setDesc('Controls creativity (0.0 = focused, 1.0 = creative)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		// Instructions
		const instructionsEl = containerEl.createEl('div', { cls: 'setting-item-description' });
		instructionsEl.innerHTML = `
			<h3>Quick Start:</h3>
			<ol>
				<li>Download <a href="https://lmstudio.ai/">LM Studio</a> and install a model</li>
				<li>Start the LM Studio server (↔ icon)</li>
				<li>Click "Test Connection" above</li>
				<li>Click the 💬 icon in Obsidian to toggle the assistant</li>
			</ol>
		`;
	}
}

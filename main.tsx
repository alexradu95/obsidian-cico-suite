import { App, Plugin, PluginSettingTab, Setting, TFile, requestUrl, Notice, WorkspaceLeaf, ItemView, MarkdownView } from 'obsidian';
import interact from '@interactjs/interactjs';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { AppContext } from './src/context/AppContext';
import { SidebarView } from './src/components/SidebarView';
import { PopoverView } from './src/components/PopoverView';

interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

type PersonalityPreset = 'concise' | 'balanced' | 'reflective' | 'poetic';
type DisplayMode = 'floating' | 'sidebar';

interface DailyAIAssistantSettings {
	lmStudioUrl: string;
	modelName: string;
	autoShowOnDailyNote: boolean;
	daysOfContext: number;
	maxTokens: number;
	temperature: number;
	autoAnalyze: boolean;
	personality: PersonalityPreset;
	defaultMode: DisplayMode;
	includeOpenTabs: boolean;
}

const DEFAULT_SETTINGS: DailyAIAssistantSettings = {
	lmStudioUrl: 'http://localhost:1234/v1',
	modelName: '',
	autoShowOnDailyNote: true,
	daysOfContext: 7,
	maxTokens: 150,
	temperature: 0.7,
	autoAnalyze: false,
	personality: 'concise',
	defaultMode: 'floating',
	includeOpenTabs: true
}

const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-sidebar';

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
	floatingPopover: AIAssistantPopover | null = null;
	sidebarView: AIAssistantSidebarView | null = null;
	currentMode: DisplayMode = 'floating';

	async onload() {
		await this.loadSettings();
		this.currentMode = this.settings.defaultMode;

		// Register sidebar view
		this.registerView(
			VIEW_TYPE_AI_ASSISTANT,
			(leaf) => (this.sidebarView = new AIAssistantSidebarView(leaf, this))
		);

		// Add ribbon icon
		this.addRibbonIcon('message-circle', 'Toggle AI Assistant', () => {
			this.toggleAssistant();
		});

		// Add command
		this.addCommand({
			id: 'toggle-ai-assistant',
			name: 'Toggle AI Assistant',
			callback: () => {
				this.toggleAssistant();
			}
		});

		// Add command to switch modes
		this.addCommand({
			id: 'toggle-assistant-mode',
			name: 'Toggle Between Floating/Sidebar Mode',
			callback: () => {
				this.switchMode();
			}
		});

		// Auto-show on daily notes
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (this.settings.autoShowOnDailyNote && file && this.isDailyNote(file)) {
					// Only auto-show if not already visible
					if (!this.isAssistantVisible()) {
						this.showAssistant();
					}
				}
				// Update context info when file changes
				this.updateAllContextInfo();
			})
		);

		// Update context when active leaf changes
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.updateAllContextInfo();
			})
		);

		// Add settings tab
		this.addSettingTab(new DailyAIAssistantSettingTab(this.app, this));
	}

	async switchMode() {
		if (this.currentMode === 'floating') {
			await this.switchToSidebar();
		} else {
			await this.switchToFloating();
		}
	}

	async switchToSidebar() {
		// Hide floating if open
		if (this.floatingPopover) {
			this.floatingPopover.hide();
		}

		// Activate sidebar
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT)[0];

		if (!leaf) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({ type: VIEW_TYPE_AI_ASSISTANT, active: true });
				leaf = rightLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}

		this.currentMode = 'sidebar';
		new Notice('Assistant pinned to sidebar');
	}

	async switchToFloating() {
		// Hide sidebar if open
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		leaves.forEach(leaf => leaf.detach());

		// Show floating
		if (!this.floatingPopover) {
			this.floatingPopover = new AIAssistantPopover(this);
		}
		this.floatingPopover.show();

		this.currentMode = 'floating';
		new Notice('Assistant unpinned (floating mode)');
	}

	toggleAssistant() {
		if (this.currentMode === 'floating') {
			if (this.floatingPopover && this.floatingPopover.isVisible()) {
				this.floatingPopover.hide();
			} else {
				this.showAssistant();
			}
		} else {
			const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
			if (leaves.length > 0) {
				leaves.forEach(leaf => leaf.detach());
			} else {
				this.showAssistant();
			}
		}
	}

	isAssistantVisible(): boolean {
		// Check if sidebar view is open
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
		if (leaves.length > 0) {
			return true;
		}

		// Check if floating popover is visible
		if (this.floatingPopover && this.floatingPopover.isVisible()) {
			return true;
		}

		return false;
	}

	showAssistant() {
		if (this.currentMode === 'floating') {
			if (!this.floatingPopover) {
				this.floatingPopover = new AIAssistantPopover(this);
			}
			this.floatingPopover.show();
		} else {
			// Check if sidebar is already open
			const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
			if (leaves.length === 0) {
				this.switchToSidebar();
			}
		}
	}

	updateAllContextInfo() {
		// Context info is now managed by React components
		// React components will update themselves through their useEffect hooks
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
			const view = leaf.view as MarkdownView;
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		this.floatingPopover?.destroy();
	}
}

// AIAssistantBase is now replaced by React components in src/components/AIAssistantView.tsx

// Sidebar View
class AIAssistantSidebarView extends ItemView {
	plugin: DailyAIAssistantPlugin;
	root: Root | null = null;

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
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
					<SidebarView onUnpin={() => this.plugin.switchToFloating()} />
				</AppContext.Provider>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}

// Floating Popover
class AIAssistantPopover {
	plugin: DailyAIAssistantPlugin;
	containerEl: HTMLElement;
	root: Root | null = null;
	visible = false;

	constructor(plugin: DailyAIAssistantPlugin) {
		this.plugin = plugin;
		this.createPopover();
		this.makeDraggable();
		this.makeResizable();
	}

	createPopover() {
		this.containerEl = document.body.createDiv('ai-assistant-popover-wrapper');

		// Initial position and size
		this.containerEl.style.left = '50px';
		this.containerEl.style.top = '100px';
		this.containerEl.style.width = '400px';
		this.containerEl.style.height = '500px';
		this.containerEl.style.position = 'fixed';
		this.containerEl.style.zIndex = '1000';

		// Create resize handles
		this.createResizeHandles();

		// Mount React component
		this.root = createRoot(this.containerEl);
		this.renderReact();
	}

	renderReact() {
		if (this.root) {
			this.root.render(
				<StrictMode>
					<AppContext.Provider value={{ app: this.plugin.app, plugin: this.plugin }}>
						<PopoverView
							onClose={() => this.hide()}
							onPin={() => this.plugin.switchToSidebar()}
							onMinimize={() => this.toggleMinimize()}
						/>
					</AppContext.Provider>
				</StrictMode>
			);
		}
	}

	createResizeHandles() {
		['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right']
			.forEach(pos => {
				this.containerEl.createDiv(`resize-handle ${pos}`);
			});
	}

	makeDraggable() {
		interact(this.containerEl)
			.draggable({
				allowFrom: '.ai-assistant-header',
				modifiers: [
					interact.modifiers.restrictRect({
						restriction: 'parent',
						endOnly: true
					})
				],
				listeners: {
					move: (event) => {
						const target = event.target as HTMLElement;
						const x = (parseFloat(target.getAttribute('data-x') || '0')) + event.dx;
						const y = (parseFloat(target.getAttribute('data-y') || '0')) + event.dy;

						target.style.transform = `translate(${x}px, ${y}px)`;
						target.setAttribute('data-x', x.toString());
						target.setAttribute('data-y', y.toString());
					}
				}
			});
	}

	makeResizable() {
		interact(this.containerEl)
			.resizable({
				edges: { left: '.left', right: '.right', bottom: '.bottom', top: '.top' },
				modifiers: [
					interact.modifiers.restrictSize({
						min: { width: 300, height: 200 }
					})
				],
				listeners: {
					move: (event) => {
						const target = event.target as HTMLElement;
						let x = parseFloat(target.getAttribute('data-x') || '0');
						let y = parseFloat(target.getAttribute('data-y') || '0');

						target.style.width = `${event.rect.width}px`;
						target.style.height = `${event.rect.height}px`;

						x += event.deltaRect.left;
						y += event.deltaRect.top;

						target.style.transform = `translate(${x}px, ${y}px)`;
						target.setAttribute('data-x', x.toString());
						target.setAttribute('data-y', y.toString());
					}
				}
			});
	}

	show() {
		this.containerEl.show();
		this.visible = true;
	}

	hide() {
		this.containerEl.hide();
		this.visible = false;
	}

	isVisible() {
		return this.visible;
	}

	toggleMinimize() {
		this.containerEl.toggleClass('minimized', !this.containerEl.hasClass('minimized'));
	}

	destroy() {
		this.root?.unmount();
		this.containerEl.remove();
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

		// Display mode
		containerEl.createEl('h3', { text: 'Display Mode' });

		new Setting(containerEl)
			.setName('Default Mode')
			.setDesc('Choose between floating popover or pinned sidebar panel')
			.addDropdown(dropdown => dropdown
				.addOption('floating', 'Floating Popover')
				.addOption('sidebar', 'Sidebar Panel')
				.setValue(this.plugin.settings.defaultMode)
				.onChange(async (value: DisplayMode) => {
					this.plugin.settings.defaultMode = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Open Tabs Context')
			.setDesc('Include content from open tabs in analysis')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeOpenTabs)
				.onChange(async (value) => {
					this.plugin.settings.includeOpenTabs = value;
					await this.plugin.saveSettings();
				}));

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

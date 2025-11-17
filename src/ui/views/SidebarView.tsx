import { ItemView, WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { AppContext } from '../../context/AppContext';
import { SidebarView as SidebarViewComponent } from '../../components/SidebarView';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { VIEW_TYPE_AI_ASSISTANT } from '../../types';
import type DailyAIAssistantPlugin from '../../main';

export class AIAssistantSidebarView extends ItemView {
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
		const { switchToFloating } = await import('../../commands');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<ErrorBoundary>
					<AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
						<SidebarViewComponent onUnpin={() => switchToFloating(this.plugin)} />
					</AppContext.Provider>
				</ErrorBoundary>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}

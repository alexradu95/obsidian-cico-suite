import { ItemView, WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { AppContext } from '../../context/AppContext';
import { SidebarView as SidebarViewComponent } from '../../components/SidebarView';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { VIEW_TYPE_AI_ASSISTANT } from '../../types';
import type DailyAIAssistantPlugin from '../../main';

/**
 * Obsidian sidebar view for the AI Assistant.
 * Extends ItemView to integrate with Obsidian's workspace system.
 * Renders the React component within the sidebar panel.
 *
 * @class AIAssistantSidebarView
 * @extends {ItemView}
 * @example
 * // Registered in the plugin's onload method
 * this.registerView(
 *   VIEW_TYPE_AI_ASSISTANT,
 *   (leaf) => new AIAssistantSidebarView(leaf, this)
 * );
 */
export class AIAssistantSidebarView extends ItemView {
	/** Reference to the plugin instance */
	plugin: DailyAIAssistantPlugin;
	/** React root for rendering the component */
	root: Root | null = null;

	/**
	 * Creates an instance of AIAssistantSidebarView.
	 *
	 * @param {WorkspaceLeaf} leaf - The workspace leaf containing this view
	 * @param {DailyAIAssistantPlugin} plugin - The plugin instance
	 */
	constructor(leaf: WorkspaceLeaf, plugin: DailyAIAssistantPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	/**
	 * Returns the unique view type identifier.
	 * Used by Obsidian to identify and manage this view.
	 *
	 * @returns {string} The view type identifier
	 */
	getViewType(): string {
		return VIEW_TYPE_AI_ASSISTANT;
	}

	/**
	 * Returns the display text shown in the view header.
	 *
	 * @returns {string} The display text 'AI Assistant'
	 */
	getDisplayText(): string {
		return 'AI Assistant';
	}

	/**
	 * Returns the icon identifier for this view.
	 * Uses Lucide icon names from Obsidian's icon set.
	 *
	 * @returns {string} The icon identifier 'message-circle'
	 */
	getIcon(): string {
		return 'message-circle';
	}

	/**
	 * Called when the view is opened.
	 * Mounts the React component tree with context and error boundary.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<ErrorBoundary>
					<AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
						<SidebarViewComponent />
					</AppContext.Provider>
				</ErrorBoundary>
			</StrictMode>
		);
	}

	/**
	 * Called when the view is closed.
	 * Unmounts the React component tree to prevent memory leaks.
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async onClose() {
		this.root?.unmount();
	}
}

/**
 * CanvasPatcher - Adds context menu support to Obsidian Canvas
 * Uses DOM manipulation to inject menu items when canvas menus appear
 */

import { setIcon } from 'obsidian';
import type DailyAIAssistantPlugin from '../main';

export class CanvasPatcher {
	private plugin: DailyAIAssistantPlugin;
	private observer: MutationObserver | null = null;

	constructor(plugin: DailyAIAssistantPlugin) {
		this.plugin = plugin;
	}

	patch(): void {
		console.log('[AI Canvas] Initializing canvas menu patcher');

		// Watch for menu elements appearing in the DOM
		this.observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node instanceof HTMLElement && node.classList.contains('menu')) {
						this.handleMenuAppeared(node);
					}
				}
			}
		});

		// Start observing the document body for menu additions
		this.observer.observe(document.body, {
			childList: true,
			subtree: false,
		});

		console.log('[AI Canvas] Canvas menu patcher initialized');
	}

	private handleMenuAppeared(menuEl: HTMLElement): void {
		// Check if we're on a canvas view
		const activeView = this.plugin.app.workspace.getActiveViewOfType(
			this.plugin.app.workspace.getLeavesOfType('canvas')[0]?.view.constructor as any
		);

		if (!activeView || activeView.getViewType() !== 'canvas') {
			return;
		}

		console.log('[AI Canvas] Canvas menu detected, adding custom items');

		// Small delay to let Obsidian populate the menu first
		setTimeout(() => {
			this.injectCanvasMenuItems(menuEl);
		}, 10);
	}

	private injectCanvasMenuItems(menuEl: HTMLElement): void {
		// Check what context we're in by examining existing menu items
		const menuItems = menuEl.querySelectorAll('.menu-item');
		const menuText = Array.from(menuItems)
			.map((item) => item.textContent)
			.join(' ');

		// Determine context based on menu content
		const isNodeMenu = menuText.includes('Color') || menuText.includes('Delete');
		const isEdgeMenu = menuText.includes('Delete') && !menuText.includes('Color');
		const isCanvasMenu = menuText.includes('Add') && menuText.includes('card');

		// Add separator
		const separator = menuEl.createDiv({ cls: 'menu-separator' });
		menuEl.appendChild(separator);

		if (isNodeMenu) {
			this.addNodeMenuItems(menuEl);
		} else if (isEdgeMenu) {
			this.addEdgeMenuItems(menuEl);
		} else if (isCanvasMenu || menuItems.length === 0) {
			this.addCanvasMenuItems(menuEl);
		}
	}

	private addNodeMenuItems(menuEl: HTMLElement): void {
		// Convert to AI Agent
		this.addMenuItem(menuEl, 'user', 'Convert to AI Agent', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			// This is a simplified version - in production you'd need to get the actual node
			console.log('[AI Canvas] Convert to AI Agent clicked');
			this.plugin.app.workspace.trigger('canvas:node-convert-to-agent' as any);
		});

		// Add connected processor
		this.addMenuItem(menuEl, 'wand-2', 'Add AI Processing Node', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			console.log('[AI Canvas] Add AI Processing Node clicked');
			this.plugin.app.workspace.trigger('canvas:node-add-processor' as any);
		});
	}

	private addEdgeMenuItems(menuEl: HTMLElement): void {
		this.addMenuItem(menuEl, 'wand-2', 'Insert AI Processing Node', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			console.log('[AI Canvas] Insert AI Processing Node clicked');
			this.plugin.app.workspace.trigger('canvas:edge-insert-processor' as any);
		});
	}

	private addCanvasMenuItems(menuEl: HTMLElement): void {
		this.addMenuItem(menuEl, 'user', 'Add AI Agent', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			const nodeId = `agent-${Date.now()}`;
			const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
			await this.plugin.canvasService.addDefaultAssistant(activeFile, position);
		});

		this.addMenuItem(menuEl, 'wand-2', 'Add AI Processing Node', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			const nodeId = `ai-processor-${Date.now()}`;
			const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
			await this.plugin.canvasService.addAIProcessingNode(
				activeFile,
				nodeId,
				'New Processor',
				'Describe what you want this AI to do with the input.',
				position
			);
		});

		this.addMenuItem(menuEl, 'file-plus', 'Add Output Node', async () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'canvas') return;

			const nodeId = `output-${Date.now()}`;
			const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
			await this.plugin.canvasService.addOutputNode(activeFile, nodeId, 'Output', position);
		});
	}

	private addMenuItem(
		menuEl: HTMLElement,
		icon: string,
		title: string,
		onClick: () => void
	): void {
		// Create menu item with exact same structure as Obsidian
		const item = menuEl.createEl('div', { cls: 'menu-item' });

		const iconEl = item.createEl('div', { cls: 'menu-item-icon' });

		// Use Obsidian's setIcon API for proper icons
		setIcon(iconEl, icon);

		item.createEl('div', { cls: 'menu-item-title', text: title });

		// Add hover effect manually with inline styles
		item.addEventListener('mouseenter', () => {
			item.style.backgroundColor = 'var(--background-modifier-hover)';
		});

		item.addEventListener('mouseleave', () => {
			item.style.backgroundColor = '';
		});

		// Add click handler
		item.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			// Close the menu
			menuEl.remove();
			// Execute the action
			onClick();
		});

		// Make cursor pointer
		item.style.cursor = 'pointer';

		menuEl.appendChild(item);
	}

	private addIconPath(svg: SVGSVGElement, icon: string): void {
		// Simple icon paths - in production, use proper lucide icons
		const iconPaths: Record<string, string> = {
			bot: 'M12 8V4m0 0L8 8m4-4l4 4m-8 8h8',
			wand: 'M15 4V2m0 2v2m0-2h2m-2 0h-2m7 10h-5m0 0v5m0-5l-3.5 3.5M4 4l16 16',
			'file-output':
				'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z',
		};

		const pathData = iconPaths[icon] || 'M12 2L2 22h20L12 2z';
		svg.createSvg('path', { attr: { d: pathData } });
	}

	destroy(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}
}

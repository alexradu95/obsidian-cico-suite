import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import interact from '@interactjs/interactjs';
import { AppContext } from '../../context/AppContext';
import { PopoverView as PopoverViewComponent } from '../../components/PopoverView';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type DailyAIAssistantPlugin from '../../main';

export class AIAssistantPopover {
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

	async renderReact() {
		if (this.root) {
			const { switchToSidebar } = await import('../../commands');
			this.root.render(
				<StrictMode>
					<ErrorBoundary>
						<AppContext.Provider value={{ app: this.plugin.app, plugin: this.plugin }}>
							<PopoverViewComponent
								onClose={() => this.hide()}
								onPin={() => switchToSidebar(this.plugin)}
								onMinimize={() => this.toggleMinimize()}
							/>
						</AppContext.Provider>
					</ErrorBoundary>
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

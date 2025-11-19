/**
 * FlowCanvasView
 * Obsidian view for displaying React Flow canvas
 * Extends ItemView to integrate with Obsidian's view system
 */

import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type DailyAIAssistantPlugin from '../main';
import { FlowCanvasConverter } from '../services/FlowCanvasConverter';
import type { JSONCanvasData } from '../types/jsoncanvas';
import { FlowCanvas } from '../components/flow/FlowCanvas';

/**
 * View type identifier for Flow Canvas
 */
export const FLOW_CANVAS_VIEW_TYPE = 'flow-canvas-view';

/**
 * File extension for canvas files
 */
export const CANVAS_FILE_EXTENSION = 'canvas';

/**
 * FlowCanvasView provides a React Flow-based canvas interface for .canvas files
 */
export class FlowCanvasView extends ItemView {
	private plugin: DailyAIAssistantPlugin;
	private file: TFile | null = null;
	private root: Root | null = null;
	private nodes: Node[] = [];
	private edges: Edge[] = [];
	private reactContainer: HTMLElement | null = null;
	private saveTimeout: NodeJS.Timeout | null = null;
	private readonly SAVE_DEBOUNCE_MS = 1000; // Save 1 second after last change

	constructor(leaf: WorkspaceLeaf, plugin: DailyAIAssistantPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	/**
	 * Returns the view type identifier
	 */
	getViewType(): string {
		return FLOW_CANVAS_VIEW_TYPE;
	}

	/**
	 * Returns the display text for the view
	 */
	getDisplayText(): string {
		return this.file?.basename || 'Canvas';
	}

	/**
	 * Returns the icon for the view
	 */
	getIcon(): string {
		return 'git-fork';
	}

	/**
	 * Called when the view is opened
	 */
	async onOpen(): Promise<void> {
		// Clear any existing content
		this.contentEl.empty();

		// Create container for React app
		this.reactContainer = this.contentEl.createDiv({
			cls: 'flow-canvas-container',
		});

		// Set up container styles to fill the view
		this.reactContainer.style.width = '100%';
		this.reactContainer.style.height = '100%';
		this.reactContainer.style.position = 'relative';

		// Load the canvas file if available
		if (this.file) {
			await this.loadCanvas(this.file);
		}

		// Create and mount React root
		this.mountReactApp();
	}

	/**
	 * Called when the view is closed
	 */
	async onClose(): Promise<void> {
		// Clear any pending save timeout
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
			this.saveTimeout = null;
		}

		// Save any pending changes immediately
		if (this.file) {
			await this.saveCanvas();
		}

		// Unmount React app
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		// Clean up container
		if (this.reactContainer) {
			this.reactContainer.empty();
			this.reactContainer = null;
		}
	}

	/**
	 * Loads a canvas file into the view
	 */
	async loadCanvas(file: TFile): Promise<void> {
		this.file = file;

		try {
			// Read the canvas data using CanvasService
			const jsonCanvas = await this.plugin.canvasService.readCanvas(file);
			console.log('[Flow Canvas] Loaded JSON Canvas:', {
				nodeCount: jsonCanvas.nodes?.length || 0,
				edgeCount: jsonCanvas.edges?.length || 0,
				nodes: jsonCanvas.nodes
			});

			// Convert to React Flow format
			const flowData = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);
			this.nodes = flowData.nodes;
			this.edges = flowData.edges;

			console.log('[Flow Canvas] Converted to Flow format:', {
				nodeCount: this.nodes.length,
				edgeCount: this.edges.length,
				nodes: this.nodes
			});

			// Update the display text (leaf header will update automatically via getDisplayText)

			// Re-render if React app is mounted
			if (this.root && this.reactContainer) {
				this.mountReactApp();
			}
		} catch (error) {
			console.error('[Flow Canvas] Error loading canvas file:', error);
			// Initialize with empty canvas on error
			this.nodes = [];
			this.edges = [];
		}
	}

	/**
	 * Saves the current canvas state to file
	 */
	async saveCanvas(): Promise<void> {
		if (!this.file) {
			console.warn('[Flow Canvas] No file to save to');
			return;
		}

		try {
			// Convert current state back to JSON Canvas format
			const jsonCanvas = FlowCanvasConverter.toJSONCanvas(this.nodes, this.edges);

			// Save using CanvasService
			await this.plugin.canvasService.writeCanvas(this.file, jsonCanvas);
			console.log('[Flow Canvas] Canvas saved successfully');
		} catch (error) {
			console.error('[Flow Canvas] Error saving canvas:', error);
		}
	}

	/**
	 * Debounced save - waits for changes to settle before saving
	 */
	private debouncedSave(): void {
		// Clear any existing timeout
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}

		// Schedule a new save
		this.saveTimeout = setTimeout(() => {
			this.saveCanvas();
			this.saveTimeout = null;
		}, this.SAVE_DEBOUNCE_MS);
	}

	/**
	 * Updates the canvas data (called by React component)
	 */
	updateCanvasData(nodes: Node[], edges: Edge[]): void {
		this.nodes = nodes;
		this.edges = edges;
	}

	/**
	 * Gets the current canvas data
	 */
	getCanvasData(): { nodes: Node[]; edges: Edge[] } {
		return {
			nodes: this.nodes,
			edges: this.edges,
		};
	}

	/**
	 * Switches from Flow Canvas view to Obsidian's default canvas view
	 */
	async switchToCanvasView(): Promise<void> {
		if (!this.file) {
			console.warn('[Flow Canvas] No file to switch to canvas view');
			return;
		}

		try {
			// Save any pending changes before switching
			await this.saveCanvas();

			// Get the current leaf
			const leaf = this.leaf;

			// Open the same file in the default canvas view
			await leaf.openFile(this.file);
		} catch (error) {
			console.error('[Flow Canvas] Error switching to canvas view:', error);
		}
	}

	/**
	 * Mounts the React application
	 */
	private mountReactApp(): void {
		if (!this.reactContainer) {
			console.error('[Flow Canvas] No container element to mount to');
			return;
		}

		// Create React root if it doesn't exist
		if (!this.root) {
			this.root = createRoot(this.reactContainer);
		}

		// Render FlowCanvas component
		const flowCanvasElement = createElement(FlowCanvas, {
			initialNodes: this.nodes,
			initialEdges: this.edges,
			onNodesChange: (nodes: Node[]) => {
				this.nodes = nodes;
				this.debouncedSave();
			},
			onEdgesChange: (edges: Edge[]) => {
				this.edges = edges;
				this.debouncedSave();
			},
			onSwitchToCanvas: () => {
				this.switchToCanvasView();
			},
			readOnly: false,
		});

		this.root.render(flowCanvasElement);
	}
}

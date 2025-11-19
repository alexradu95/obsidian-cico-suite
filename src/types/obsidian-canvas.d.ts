/**
 * Canvas Internal API Type Definitions
 * These are reverse-engineered from Obsidian's internal Canvas implementation
 * WARNING: These are undocumented APIs that may change without notice
 */

import { Menu, TFile, EventRef } from 'obsidian';

export type BBox = {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export type Pos = {
	x: number;
	y: number;
};

export type AllCanvasNodeData = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color?: string;
	type: string;
	text?: string;
	file?: string;
	url?: string;
	subpath?: string;
}

export type EdgeData = {
	id: string;
	fromNode: string;
	fromSide: string;
	toNode: string;
	toSide: string;
	color?: string;
	label?: string;
}

export type CanvasNode = {
	canvas: Canvas;
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	bbox: BBox;
	color: string;

	nodeEl: HTMLElement;
	labelEl?: HTMLElement;
	contentEl?: HTMLElement;

	getData(): AllCanvasNodeData;
	setData(data: Partial<AllCanvasNodeData>): void;
	setColor(color: string): void;
	render(): void;

	// File nodes
	file?: TFile;
}

export type CanvasEdge = {
	canvas: Canvas;
	id: string;
	from: {
		node: CanvasNode;
		side: string;
	};
	to: {
		node: CanvasNode;
		side: string;
	};

	lineGroupEl: HTMLElement;

	getData(): EdgeData;
	setData(data: Partial<EdgeData>): void;
	render(): void;
}

export type Canvas = {
	nodes: Map<string, CanvasNode>;
	edges: Map<string, CanvasEdge>;

	// Edge connection maps
	edgeFrom: Map<string, Set<CanvasEdge>>;
	edgeTo: Map<string, Set<CanvasEdge>>;

	// Selection
	selection: Set<CanvasNode | CanvasEdge>;
	updateSelection(callback: () => void): void;

	// Viewport
	tx: number;
	ty: number;
	tZoom: number;
	setViewport(tx: number, ty: number, tZoom: number): void;
	zoomToFit(): void;
	zoomToBbox(bbox: BBox): void;
	getViewportBBox(): BBox;
	markViewportChanged(): void;

	// Coordinate transformation
	posFromClient(x: number, y: number): Pos;

	// Data management
	setData(data: { nodes: AllCanvasNodeData[]; edges: EdgeData[] }): void;
	getData(): { nodes: AllCanvasNodeData[]; edges: EdgeData[] };

	// History
	pushHistory(data: AllCanvasNodeData): void;
	markDirty(): void;

	// State
	readonly: boolean;
	isDragging: boolean;
	initialized: boolean;

	// Menu creation (internal methods we'll patch)
	showCreationMenu?(menu: Menu, pos: Pos): void;
	showNodeMenu?(menu: Menu, node: CanvasNode): void;
	showEdgeMenu?(menu: Menu, edge: CanvasEdge): void;
}

export type CanvasView = {
	canvas: Canvas;
	file: TFile;

	onOpen(): Promise<void>;
	onClose(): Promise<void>;
	getViewType(): string;
}

declare module 'obsidian' {
	interface Workspace {
		on(name: 'canvas:node-menu', callback: (menu: Menu, node: CanvasNode) => void): EventRef;
		on(name: 'canvas:edge-menu', callback: (menu: Menu, edge: CanvasEdge) => void): EventRef;
		on(name: 'canvas:selection-menu', callback: (menu: Menu, canvas: Canvas) => void): EventRef;
	}
}

import { Agent } from './agent';

/**
 * Type of node on the canvas
 */
export enum CanvasNodeType {
	AGENT = 'agent',
	NOTE = 'note',
	TEXT = 'text'
}

/**
 * Position of a node on the canvas
 */
export interface Position {
	x: number;
	y: number;
}

/**
 * Size of a node
 */
export interface Size {
	width: number;
	height: number;
}

/**
 * Base canvas node
 */
export interface BaseCanvasNode {
	id: string;
	type: CanvasNodeType;
	position: Position;
	size: Size;
	selected?: boolean;
}

/**
 * Agent node on the canvas
 */
export interface AgentCanvasNode extends BaseCanvasNode {
	type: CanvasNodeType.AGENT;
	agent: Agent;
}

/**
 * Note node on the canvas (links to Obsidian note)
 */
export interface NoteCanvasNode extends BaseCanvasNode {
	type: CanvasNodeType.NOTE;
	notePath: string;
	noteTitle: string;
}

/**
 * Text node on the canvas
 */
export interface TextCanvasNode extends BaseCanvasNode {
	type: CanvasNodeType.TEXT;
	content: string;
}

/**
 * Union type of all canvas nodes
 */
export type CanvasNode = AgentCanvasNode | NoteCanvasNode | TextCanvasNode;

/**
 * Connection between two nodes
 */
export interface CanvasConnection {
	id: string;
	sourceNodeId: string;
	targetNodeId: string;
	label?: string;
}

/**
 * Canvas data structure
 */
export interface CanvasData {
	nodes: CanvasNode[];
	connections: CanvasConnection[];
}

/**
 * View type identifier for the agent canvas
 */
export const VIEW_TYPE_AGENT_CANVAS = 'agent-canvas-view';
/**
 * JSON Canvas format types based on spec 1.0
 * https://jsoncanvas.org/spec/1.0/
 */

/**
 * Preset color numbers for JSON Canvas
 */
export type CanvasColor = '1' | '2' | '3' | '4' | '5' | '6' | string;

/**
 * Valid node types in JSON Canvas
 */
export type JSONCanvasNodeType = 'text' | 'file' | 'link' | 'group';

/**
 * Base properties common to all nodes
 */
export interface JSONCanvasBaseNode {
	id: string;
	type: JSONCanvasNodeType;
	x: number;
	y: number;
	width: number;
	height: number;
	color?: CanvasColor;
}

/**
 * Text type node
 */
export interface JSONCanvasTextNode extends JSONCanvasBaseNode {
	type: 'text';
	text: string;
}

/**
 * File type node
 */
export interface JSONCanvasFileNode extends JSONCanvasBaseNode {
	type: 'file';
	file: string;
	subpath?: string;
}

/**
 * Link type node
 */
export interface JSONCanvasLinkNode extends JSONCanvasBaseNode {
	type: 'link';
	url: string;
}

/**
 * Group type node
 */
export interface JSONCanvasGroupNode extends JSONCanvasBaseNode {
	type: 'group';
	label?: string;
	background?: string;
	backgroundStyle?: 'cover' | 'ratio' | 'repeat';
}

/**
 * Union type for all node types
 */
export type JSONCanvasNode =
	| JSONCanvasTextNode
	| JSONCanvasFileNode
	| JSONCanvasLinkNode
	| JSONCanvasGroupNode;

/**
 * Valid edge side values
 */
export type EdgeSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Valid edge endpoint shapes
 */
export type EdgeEnd = 'none' | 'arrow';

/**
 * Edge (connection) in JSON Canvas
 */
export interface JSONCanvasEdge {
	id: string;
	fromNode: string;
	fromSide?: EdgeSide;
	fromEnd?: EdgeEnd;
	toNode: string;
	toSide?: EdgeSide;
	toEnd?: EdgeEnd;
	color?: CanvasColor;
	label?: string;
}

/**
 * Complete JSON Canvas structure
 */
export interface JSONCanvasData {
	nodes?: JSONCanvasNode[];
	edges?: JSONCanvasEdge[];
}

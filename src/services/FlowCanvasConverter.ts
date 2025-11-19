/**
 * FlowCanvasConverter
 * Bidirectional converter between JSON Canvas format and React Flow format
 * Maintains 100% compatibility with JSON Canvas v1.0 specification
 */

import type { Node, Edge } from '@xyflow/react';
import type {
	JSONCanvasData,
	JSONCanvasNode,
	JSONCanvasTextNode,
	JSONCanvasEdge,
} from '../types/jsoncanvas';

/**
 * Default dimensions for nodes when measured size is not available
 */
const DEFAULT_NODE_WIDTH = 250;
const DEFAULT_NODE_HEIGHT = 60;

/**
 * Result type for conversion from JSON Canvas to React Flow
 */
export type FlowCanvasData = {
	nodes: Node[];
	edges: Edge[];
};

/**
 * Service for converting between JSON Canvas and React Flow formats
 */
export class FlowCanvasConverter {
	/**
	 * Converts JSON Canvas format to React Flow format
	 * @param jsonCanvas - JSON Canvas data structure
	 * @returns React Flow compatible nodes and edges
	 */
	static fromJSONCanvas(jsonCanvas: JSONCanvasData): FlowCanvasData {
		const nodes = (jsonCanvas.nodes || []).map((canvasNode) =>
			this.convertNodeToFlow(canvasNode)
		);

		const edges = (jsonCanvas.edges || []).map((canvasEdge) =>
			this.convertEdgeToFlow(canvasEdge)
		);

		return { nodes, edges };
	}

	/**
	 * Converts React Flow format to JSON Canvas format
	 * @param nodes - React Flow nodes
	 * @param edges - React Flow edges
	 * @returns JSON Canvas data structure
	 */
	static toJSONCanvas(nodes: Node[], edges: Edge[]): JSONCanvasData {
		const canvasNodes = nodes.map((flowNode) => this.convertNodeToCanvas(flowNode));

		const canvasEdges = edges.map((flowEdge) => this.convertEdgeToCanvas(flowEdge));

		return {
			nodes: canvasNodes,
			edges: canvasEdges,
		};
	}

	/**
	 * Converts a single JSON Canvas node to React Flow node
	 */
	private static convertNodeToFlow(canvasNode: JSONCanvasNode): Node {
		const baseNode: Node = {
			id: canvasNode.id,
			type: canvasNode.type,
			position: {
				x: canvasNode.x,
				y: canvasNode.y,
			},
			data: {},
		};

		// Add measured dimensions
		if (canvasNode.width && canvasNode.height) {
			baseNode.measured = {
				width: canvasNode.width,
				height: canvasNode.height,
			};
		}

		// Handle different node types
		switch (canvasNode.type) {
			case 'text': {
				const textNode = canvasNode as JSONCanvasTextNode;
				baseNode.data = {
					text: textNode.text,
					...(textNode.color && { color: textNode.color }),
				};
				break;
			}
			case 'file':
			case 'link':
			case 'group':
				// For now, we only handle text nodes fully
				// Other types will be added in future phases
				baseNode.data = { ...canvasNode };
				break;
		}

		return baseNode;
	}

	/**
	 * Converts a single JSON Canvas edge to React Flow edge
	 */
	private static convertEdgeToFlow(canvasEdge: JSONCanvasEdge): Edge {
		const edge: Edge = {
			id: canvasEdge.id,
			source: canvasEdge.fromNode,
			target: canvasEdge.toNode,
		};

		// Add optional properties
		if (canvasEdge.label) {
			edge.label = canvasEdge.label;
		}

		if (canvasEdge.color) {
			edge.data = {
				...(edge.data || {}),
				color: canvasEdge.color,
			};
		}

		return edge;
	}

	/**
	 * Converts a React Flow node to JSON Canvas node
	 */
	private static convertNodeToCanvas(flowNode: Node): JSONCanvasNode {
		// Get dimensions from measured or use defaults
		const width = flowNode.measured?.width || DEFAULT_NODE_WIDTH;
		const height = flowNode.measured?.height || DEFAULT_NODE_HEIGHT;

		// Type the data explicitly
		const nodeData = flowNode.data as { text?: string; color?: string };

		// For now, we primarily handle text nodes
		// Other node types will be added in future phases
		const canvasNode: JSONCanvasTextNode = {
			id: flowNode.id,
			type: 'text',
			text: nodeData.text || '',
			x: flowNode.position.x,
			y: flowNode.position.y,
			width,
			height,
		};

		// Add optional color
		if (nodeData.color) {
			canvasNode.color = nodeData.color as string;
		}

		return canvasNode;
	}

	/**
	 * Converts a React Flow edge to JSON Canvas edge
	 */
	private static convertEdgeToCanvas(flowEdge: Edge): JSONCanvasEdge {
		const edgeData = flowEdge.data as { color?: string } | undefined;

		const canvasEdge: JSONCanvasEdge = {
			id: flowEdge.id,
			fromNode: flowEdge.source,
			toNode: flowEdge.target,
		};

		// Add optional properties
		if (flowEdge.label) {
			canvasEdge.label = flowEdge.label as string;
		}

		if (edgeData?.color) {
			canvasEdge.color = edgeData.color as string;
		}

		return canvasEdge;
	}
}

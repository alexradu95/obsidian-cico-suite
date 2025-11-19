/**
 * FlowCanvasConverter Tests
 * Tests bidirectional conversion between JSON Canvas and React Flow formats
 */

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import type {
	JSONCanvasData,
	JSONCanvasTextNode,
	JSONCanvasEdge,
	JSONCanvasNode,
} from '../types/jsoncanvas';
import { FlowCanvasConverter } from './FlowCanvasConverter';

describe('FlowCanvasConverter', () => {
	describe('fromJSONCanvas - JSON Canvas to React Flow', () => {
		it('should convert empty canvas to empty React Flow data', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [],
				edges: [],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.nodes).toEqual([]);
			expect(result.edges).toEqual([]);
		});

		it('should convert single text node to React Flow node', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'Hello World',
						x: 100,
						y: 200,
						width: 300,
						height: 150,
						color: '4',
					},
				],
				edges: [],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.nodes).toHaveLength(1);
			expect(result.nodes[0]).toMatchObject({
				id: 'node-1',
				type: 'text',
				position: { x: 100, y: 200 },
				data: {
					text: 'Hello World',
					color: '4',
				},
			});
			expect(result.nodes[0].measured?.width).toBe(300);
			expect(result.nodes[0].measured?.height).toBe(150);
		});

		it('should convert AI Agent node with custom data', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'agent-1',
						type: 'text',
						text: '# 🤖 AI Agent\n\n> **Default Assistant**\n\n**Role:** general',
						x: 100,
						y: 100,
						width: 400,
						height: 250,
						color: '4',
					},
				],
				edges: [],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.nodes).toHaveLength(1);
			expect(result.nodes[0].data.text).toContain('🤖 AI Agent');
			expect(result.nodes[0].data.color).toBe('4');
		});

		it('should convert single edge to React Flow edge', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'Source',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
					},
					{
						id: 'node-2',
						type: 'text',
						text: 'Target',
						x: 200,
						y: 0,
						width: 100,
						height: 100,
					},
				],
				edges: [
					{
						id: 'edge-1',
						fromNode: 'node-1',
						toNode: 'node-2',
						label: 'Connection',
						color: '4',
					},
				],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.edges).toHaveLength(1);
			expect(result.edges[0]).toMatchObject({
				id: 'edge-1',
				source: 'node-1',
				target: 'node-2',
				label: 'Connection',
				data: {
					color: '4',
				},
			});
		});

		it('should handle nodes without optional color', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'No color',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
					},
				],
				edges: [],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.nodes[0].data.color).toBeUndefined();
		});

		it('should handle edges without optional label and color', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'A',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
					},
					{
						id: 'node-2',
						type: 'text',
						text: 'B',
						x: 200,
						y: 0,
						width: 100,
						height: 100,
					},
				],
				edges: [
					{
						id: 'edge-1',
						fromNode: 'node-1',
						toNode: 'node-2',
					},
				],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.edges[0].label).toBeUndefined();
			expect(result.edges[0].data?.color).toBeUndefined();
		});

		it('should convert multiple nodes and edges', () => {
			const jsonCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'First',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
					},
					{
						id: 'node-2',
						type: 'text',
						text: 'Second',
						x: 200,
						y: 0,
						width: 100,
						height: 100,
					},
					{
						id: 'node-3',
						type: 'text',
						text: 'Third',
						x: 400,
						y: 0,
						width: 100,
						height: 100,
					},
				],
				edges: [
					{
						id: 'edge-1',
						fromNode: 'node-1',
						toNode: 'node-2',
					},
					{
						id: 'edge-2',
						fromNode: 'node-2',
						toNode: 'node-3',
					},
				],
			};

			const result = FlowCanvasConverter.fromJSONCanvas(jsonCanvas);

			expect(result.nodes).toHaveLength(3);
			expect(result.edges).toHaveLength(2);
		});
	});

	describe('toJSONCanvas - React Flow to JSON Canvas', () => {
		it('should convert empty React Flow data to empty canvas', () => {
			const nodes: Node[] = [];
			const edges: Edge[] = [];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			expect(result.nodes).toEqual([]);
			expect(result.edges).toEqual([]);
		});

		it('should convert single React Flow node to JSON Canvas text node', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 100, y: 200 },
					data: {
						text: 'Hello World',
						color: '4',
					},
					measured: {
						width: 300,
						height: 150,
					},
				},
			];
			const edges: Edge[] = [];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			expect(result.nodes).toHaveLength(1);
			const node = result.nodes![0] as JSONCanvasTextNode;
			expect(node).toMatchObject({
				id: 'node-1',
				type: 'text',
				text: 'Hello World',
				x: 100,
				y: 200,
				width: 300,
				height: 150,
				color: '4',
			});
		});

		it('should use default dimensions when measured size not available', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 0, y: 0 },
					data: {
						text: 'Test',
					},
				},
			];
			const edges: Edge[] = [];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			const node = result.nodes![0] as JSONCanvasTextNode;
			expect(node.width).toBe(250);
			expect(node.height).toBe(60);
		});

		it('should convert React Flow edge to JSON Canvas edge', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 0, y: 0 },
					data: { text: 'Source' },
				},
				{
					id: 'node-2',
					type: 'text',
					position: { x: 200, y: 0 },
					data: { text: 'Target' },
				},
			];
			const edges: Edge[] = [
				{
					id: 'edge-1',
					source: 'node-1',
					target: 'node-2',
					label: 'Connection',
					data: {
						color: '4',
					},
				},
			];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			expect(result.edges).toHaveLength(1);
			expect(result.edges![0]).toMatchObject({
				id: 'edge-1',
				fromNode: 'node-1',
				toNode: 'node-2',
				label: 'Connection',
				color: '4',
			});
		});

		it('should handle nodes without optional properties', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 0, y: 0 },
					data: {
						text: 'Simple node',
					},
				},
			];
			const edges: Edge[] = [];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			const node = result.nodes![0] as JSONCanvasTextNode;
			expect(node.color).toBeUndefined();
		});

		it('should handle edges without optional properties', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 0, y: 0 },
					data: { text: 'A' },
				},
				{
					id: 'node-2',
					type: 'text',
					position: { x: 200, y: 0 },
					data: { text: 'B' },
				},
			];
			const edges: Edge[] = [
				{
					id: 'edge-1',
					source: 'node-1',
					target: 'node-2',
				},
			];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			const edge = result.edges![0];
			expect(edge.label).toBeUndefined();
			expect(edge.color).toBeUndefined();
		});

		it('should convert multiple nodes and edges', () => {
			const nodes: Node[] = [
				{
					id: 'node-1',
					type: 'text',
					position: { x: 0, y: 0 },
					data: { text: 'First' },
				},
				{
					id: 'node-2',
					type: 'text',
					position: { x: 200, y: 0 },
					data: { text: 'Second' },
				},
				{
					id: 'node-3',
					type: 'text',
					position: { x: 400, y: 0 },
					data: { text: 'Third' },
				},
			];
			const edges: Edge[] = [
				{
					id: 'edge-1',
					source: 'node-1',
					target: 'node-2',
				},
				{
					id: 'edge-2',
					source: 'node-2',
					target: 'node-3',
				},
			];

			const result = FlowCanvasConverter.toJSONCanvas(nodes, edges);

			expect(result.nodes).toHaveLength(3);
			expect(result.edges).toHaveLength(2);
		});
	});

	describe('Bidirectional conversion - Round-trip integrity', () => {
		it('should maintain data integrity through round-trip conversion', () => {
			const originalCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'node-1',
						type: 'text',
						text: 'Test Node',
						x: 100,
						y: 200,
						width: 300,
						height: 150,
						color: '4',
					},
					{
						id: 'node-2',
						type: 'text',
						text: 'Another Node',
						x: 500,
						y: 200,
						width: 300,
						height: 150,
						color: '6',
					},
				],
				edges: [
					{
						id: 'edge-1',
						fromNode: 'node-1',
						toNode: 'node-2',
						label: 'Connection',
						color: '4',
					},
				],
			};

			// JSON Canvas → React Flow
			const flowData = FlowCanvasConverter.fromJSONCanvas(originalCanvas);

			// React Flow → JSON Canvas
			const reconvertedCanvas = FlowCanvasConverter.toJSONCanvas(
				flowData.nodes,
				flowData.edges
			);

			// Verify nodes match
			expect(reconvertedCanvas.nodes).toHaveLength(originalCanvas.nodes!.length);
			expect(reconvertedCanvas.edges).toHaveLength(originalCanvas.edges!.length);

			const originalNode = originalCanvas.nodes![0] as JSONCanvasTextNode;
			const reconvertedNode = reconvertedCanvas.nodes![0] as JSONCanvasTextNode;

			expect(reconvertedNode).toMatchObject({
				id: originalNode.id,
				type: originalNode.type,
				text: originalNode.text,
				x: originalNode.x,
				y: originalNode.y,
				width: originalNode.width,
				height: originalNode.height,
				color: originalNode.color,
			});

			// Verify edges match
			const originalEdge = originalCanvas.edges![0];
			const reconvertedEdge = reconvertedCanvas.edges![0];

			expect(reconvertedEdge).toMatchObject({
				id: originalEdge.id,
				fromNode: originalEdge.fromNode,
				toNode: originalEdge.toNode,
				label: originalEdge.label,
				color: originalEdge.color,
			});
		});

		it('should handle complex canvas with multiple node types', () => {
			const originalCanvas: JSONCanvasData = {
				nodes: [
					{
						id: 'agent-1',
						type: 'text',
						text: '# 🤖 AI Agent\n\n> **Default Assistant**',
						x: 0,
						y: 0,
						width: 400,
						height: 250,
						color: '4',
					},
					{
						id: 'processor-1',
						type: 'text',
						text: '# ⚙️ AI Processor\n\n> **Summarizer**',
						x: 500,
						y: 0,
						width: 350,
						height: 200,
						color: '6',
					},
					{
						id: 'output-1',
						type: 'text',
						text: '# 📤 Output\n\n> **Result**',
						x: 1000,
						y: 0,
						width: 350,
						height: 300,
						color: '3',
					},
				],
				edges: [
					{
						id: 'edge-1',
						fromNode: 'agent-1',
						toNode: 'processor-1',
						color: '4',
					},
					{
						id: 'edge-2',
						fromNode: 'processor-1',
						toNode: 'output-1',
						color: '4',
					},
				],
			};

			const flowData = FlowCanvasConverter.fromJSONCanvas(originalCanvas);
			const reconvertedCanvas = FlowCanvasConverter.toJSONCanvas(
				flowData.nodes,
				flowData.edges
			);

			expect(reconvertedCanvas.nodes).toHaveLength(3);
			expect(reconvertedCanvas.edges).toHaveLength(2);

			// Verify AI Agent node preserved
			const agentNode = reconvertedCanvas.nodes!.find(
				(n) => n.id === 'agent-1'
			) as JSONCanvasTextNode;
			expect(agentNode.text).toContain('🤖 AI Agent');
			expect(agentNode.color).toBe('4');

			// Verify Processor node preserved
			const processorNode = reconvertedCanvas.nodes!.find(
				(n) => n.id === 'processor-1'
			) as JSONCanvasTextNode;
			expect(processorNode.text).toContain('⚙️ AI Processor');
			expect(processorNode.color).toBe('6');

			// Verify Output node preserved
			const outputNode = reconvertedCanvas.nodes!.find(
				(n) => n.id === 'output-1'
			) as JSONCanvasTextNode;
			expect(outputNode.text).toContain('📤 Output');
			expect(outputNode.color).toBe('3');
		});
	});
});

/**
 * FlowCanvas Component
 * Main React Flow canvas component for visual AI workflows
 */

import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
	ReactFlow,
	ReactFlowProvider,
	Background,
	Controls,
	MiniMap,
	Panel,
	useNodesState,
	useEdgesState,
	addEdge,
	Connection,
	Edge,
	Node,
	NodeTypes,
	EdgeTypes,
} from '@xyflow/react';
import { TextNode } from '../nodes/TextNode';

/**
 * Props for FlowCanvas component
 */
export type FlowCanvasProps = {
	/**
	 * Initial nodes for the canvas
	 */
	initialNodes: Node[];

	/**
	 * Initial edges for the canvas
	 */
	initialEdges: Edge[];

	/**
	 * Callback when nodes change
	 */
	onNodesChange?: (nodes: Node[]) => void;

	/**
	 * Callback when edges change
	 */
	onEdgesChange?: (edges: Edge[]) => void;

	/**
	 * Callback to switch to Obsidian's default canvas view
	 */
	onSwitchToCanvas?: () => void;

	/**
	 * Whether the canvas is read-only
	 */
	readOnly?: boolean;
};

/**
 * Internal FlowCanvas component (wrapped by ReactFlowProvider below)
 */
function FlowCanvasInternal({
	initialNodes,
	initialEdges,
	onNodesChange,
	onEdgesChange,
	onSwitchToCanvas,
	readOnly = false,
}: FlowCanvasProps) {
	// Use React Flow's built-in state management
	const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

	// Update nodes/edges when initialNodes/initialEdges change
	React.useEffect(() => {
		console.log('[FlowCanvas] Updating nodes/edges:', {
			nodeCount: initialNodes.length,
			edgeCount: initialEdges.length,
			nodes: initialNodes,
			edges: initialEdges
		});
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges, setNodes, setEdges]);

	// Debug current state
	React.useEffect(() => {
		console.log('[FlowCanvas] Current state:', {
			nodeCount: nodes.length,
			edgeCount: edges.length,
			edges: edges
		});
	}, [nodes, edges]);

	// Handle connection creation
	const onConnect = useCallback(
		(connection: Connection) => {
			setEdges((eds) => addEdge(connection, eds));
		},
		[setEdges]
	);

	// Notify parent when nodes change
	const handleNodesChange = useCallback(
		(changes: unknown) => {
			onNodesChangeInternal(changes as Parameters<typeof onNodesChangeInternal>[0]);
			if (onNodesChange) {
				// Use a small delay to ensure state has updated
				setTimeout(() => {
					onNodesChange(nodes);
				}, 0);
			}
		},
		[onNodesChangeInternal, onNodesChange, nodes]
	);

	// Notify parent when edges change
	const handleEdgesChange = useCallback(
		(changes: unknown) => {
			onEdgesChangeInternal(changes as Parameters<typeof onEdgesChangeInternal>[0]);
			if (onEdgesChange) {
				// Use a small delay to ensure state has updated
				setTimeout(() => {
					onEdgesChange(edges);
				}, 0);
			}
		},
		[onEdgesChangeInternal, onEdgesChange, edges]
	);

	// Custom node types
	const nodeTypes: NodeTypes = useMemo(() => {
		const types = {
			text: TextNode,
		};
		console.log('[FlowCanvas] Node types registered:', types);
		return types;
	}, []);

	// Custom edge types will be added in Phase 2
	const edgeTypes: EdgeTypes = useMemo(() => ({}), []);

	/**
	 * Helper to get CSS color value from canvas color code
	 */
	const getColorValue = useCallback((colorCode: string): string => {
		const colorMap: Record<string, string> = {
			'1': '#ff6b6b', // red
			'2': '#f59e42', // orange
			'3': '#ffd43b', // yellow
			'4': '#51cf66', // green
			'5': '#339af0', // cyan
			'6': '#be4bdb', // purple
		};

		return colorMap[colorCode] || 'var(--interactive-accent)';
	}, []);

	return (
		<div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={handleNodesChange}
				onEdgesChange={handleEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				fitView
				attributionPosition="bottom-right"
				nodesDraggable={true}
				nodesConnectable={true}
				nodesFocusable={true}
				edgesFocusable={true}
				elementsSelectable={true}
				selectNodesOnDrag={false}
				panOnDrag={[1, 2]}
				defaultEdgeOptions={{
					type: 'default',
					animated: false,
					style: { stroke: 'var(--interactive-accent)', strokeWidth: 2 },
				}}
				style={{
					background: 'var(--background-primary)',
				}}
			>
				{/* Background pattern */}
				<Background
					color="var(--background-modifier-border)"
					gap={16}
					size={1}
				/>

				{/* Controls (zoom, fit view, etc.) */}
				<Controls
					showInteractive={!readOnly}
				/>

				{/* Mini map for navigation */}
				<MiniMap
					nodeColor={(node) => {
						// Use node color if available, otherwise use default
						const color = (node.data as { color?: string }).color;
						return color ? getColorValue(color) : 'var(--interactive-accent)';
					}}
					style={{
						backgroundColor: 'var(--background-primary-alt)',
					}}
				/>

				{/* Info panel */}
				<Panel position="top-left">
					<div
						style={{
							padding: '8px 12px',
							background: 'var(--background-primary-alt)',
							border: '1px solid var(--background-modifier-border)',
							borderRadius: '4px',
							fontSize: '12px',
							color: 'var(--text-muted)',
						}}
					>
						{nodes.length} nodes, {edges.length} edges
					</div>
				</Panel>

				{/* Switch to canvas button */}
				{onSwitchToCanvas && (
					<Panel position="top-right">
						<button
							onClick={onSwitchToCanvas}
							style={{
								padding: '8px 12px',
								background: 'var(--interactive-normal)',
								border: '1px solid var(--background-modifier-border)',
								borderRadius: '4px',
								fontSize: '12px',
								color: 'var(--text-normal)',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'var(--interactive-hover)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'var(--interactive-normal)';
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M3 3h18v18H3z" />
								<path d="M9 9h6v6H9z" />
							</svg>
							Switch to Canvas
						</button>
					</Panel>
				)}
			</ReactFlow>
		</div>
	);
};

/**
 * FlowCanvas provides the main canvas interface using React Flow
 * Wrapped with ReactFlowProvider for proper context
 */
export function FlowCanvas(props: FlowCanvasProps) {
	return (
		<ReactFlowProvider>
			<FlowCanvasInternal {...props} />
		</ReactFlowProvider>
	);
}

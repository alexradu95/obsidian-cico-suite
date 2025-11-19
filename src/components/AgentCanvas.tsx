import * as React from 'react';
import { CanvasData, CanvasNode, CanvasNodeType, AgentCanvasNode, NoteCanvasNode, CanvasConnection } from '../types/canvas';
import { createDefaultAgent } from '../utils/agentHelpers';

/**
 * Props for AgentCanvas component
 */
export interface AgentCanvasProps {
	/** Canvas data containing nodes and connections */
	data: CanvasData;
	/** Callback when canvas data changes */
	onDataChange: (data: CanvasData) => void;
}

/**
 * State for tracking node drag operations
 */
interface DragState {
	nodeId: string;
	startX: number;
	startY: number;
	nodeStartX: number;
	nodeStartY: number;
}

/**
 * State for tracking connection creation
 */
interface ConnectionState {
	sourceNodeId: string | null;
}

/**
 * Canvas component for visual multi-agent network
 * Allows dragging nodes, creating connections, and interacting with agents
 */
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 150;
const DEFAULT_NODE_POSITION_X = 300;
const DEFAULT_NODE_POSITION_Y = 200;

const generateNodeId = (): string => {
	return `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const AgentCanvas = (props: AgentCanvasProps) => {
	const { data, onDataChange } = props;
	const [dragState, setDragState] = React.useState<DragState | null>(null);
	const [connectionState, setConnectionState] = React.useState<ConnectionState>({ sourceNodeId: null });
	const [isConnectMode, setIsConnectMode] = React.useState(false);

	const handleAddAgent = () => {
		const newAgent = createDefaultAgent();
		const newNode: AgentCanvasNode = {
			id: generateNodeId(),
			type: CanvasNodeType.AGENT,
			position: { x: DEFAULT_NODE_POSITION_X, y: DEFAULT_NODE_POSITION_Y },
			size: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
			agent: newAgent
		};

		onDataChange({
			...data,
			nodes: [...data.nodes, newNode]
		});
	};

	const handleAddNote = () => {
		const newNode: NoteCanvasNode = {
			id: generateNodeId(),
			type: CanvasNodeType.NOTE,
			position: { x: DEFAULT_NODE_POSITION_X, y: DEFAULT_NODE_POSITION_Y },
			size: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
			notePath: 'New Note.md',
			noteTitle: 'New Note'
		};

		onDataChange({
			...data,
			nodes: [...data.nodes, newNode]
		});
	};

	const handleConnect = () => {
		setIsConnectMode(true);
		setConnectionState({ sourceNodeId: null });
	};

	const handleNodeClick = (nodeId: string) => {
		if (!isConnectMode) return;

		if (connectionState.sourceNodeId === null) {
			// First click - set source node
			setConnectionState({ sourceNodeId: nodeId });
		} else {
			// Second click - create connection
			const newConnection: CanvasConnection = {
				id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				sourceNodeId: connectionState.sourceNodeId,
				targetNodeId: nodeId
			};

			onDataChange({
				...data,
				connections: [...data.connections, newConnection]
			});

			// Exit connect mode
			setIsConnectMode(false);
			setConnectionState({ sourceNodeId: null });
		}
	};

	const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
		// Don't start drag if in connect mode
		if (isConnectMode) return;

		const node = data.nodes.find(n => n.id === nodeId);
		if (!node) return;

		setDragState({
			nodeId,
			startX: e.clientX,
			startY: e.clientY,
			nodeStartX: node.position.x,
			nodeStartY: node.position.y
		});
	};

	React.useEffect(() => {
		if (!dragState) return;

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - dragState.startX;
			const deltaY = e.clientY - dragState.startY;

			const updatedNodes = data.nodes.map(node => {
				if (node.id === dragState.nodeId) {
					return {
						...node,
						position: {
							x: dragState.nodeStartX + deltaX,
							y: dragState.nodeStartY + deltaY
						}
					};
				}
				return node;
			});

			onDataChange({
				...data,
				nodes: updatedNodes
			});
		};

		const handleMouseUp = () => {
			setDragState(null);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragState, data, onDataChange]);

	return (
		<div className="agent-canvas-container" data-testid="agent-canvas">
			{/* Toolbar */}
			<div className="agent-canvas-toolbar">
				<button onClick={handleAddAgent}>Add Agent</button>
				<button onClick={handleAddNote}>Add Note</button>
				<button onClick={handleConnect}>Connect</button>
				<div className="node-count">
					{data.nodes.length} nodes, {data.connections.length} connections
				</div>
			</div>

			{/* Canvas */}
			<div className="agent-canvas-workspace">
				{data.nodes.length === 0 ? (
					<div className="agent-canvas-empty">
						Click "Add Agent" or "Add Note" to start building your network
					</div>
				) : (
					<>
						{/* Render nodes */}
						{data.nodes.map(node => (
							<CanvasNodeComponent
								key={node.id}
								node={node}
								onMouseDown={handleNodeMouseDown}
								onClick={handleNodeClick}
							/>
						))}

						{/* Render connections */}
						<svg className="agent-canvas-connections">
							{data.connections.map(conn => {
								const sourceNode = data.nodes.find(n => n.id === conn.sourceNodeId);
								const targetNode = data.nodes.find(n => n.id === conn.targetNodeId);

								if (!sourceNode || !targetNode) return null;

								const x1 = sourceNode.position.x + sourceNode.size.width / 2;
								const y1 = sourceNode.position.y + sourceNode.size.height / 2;
								const x2 = targetNode.position.x + targetNode.size.width / 2;
								const y2 = targetNode.position.y + targetNode.size.height / 2;

								return (
									<line
										key={conn.id}
										x1={x1}
										y1={y1}
										x2={x2}
										y2={y2}
										stroke="#888"
										strokeWidth="2"
									/>
								);
							})}
						</svg>
					</>
				)}
			</div>
		</div>
	);
};

/**
 * Component for rendering individual canvas nodes
 */
interface CanvasNodeComponentProps {
	node: CanvasNode;
	onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
	onClick: (nodeId: string) => void;
}

const CanvasNodeComponent = (props: CanvasNodeComponentProps) => {
	const { node, onMouseDown, onClick } = props;

	const style: React.CSSProperties = {
		position: 'absolute',
		left: node.position.x,
		top: node.position.y,
		width: node.size.width,
		height: node.size.height,
		border: '1px solid #ccc',
		borderRadius: '8px',
		padding: '12px',
		backgroundColor: 'white',
		cursor: 'move'
	};

	if (node.type === CanvasNodeType.AGENT) {
		const agentNode = node as AgentCanvasNode;
		return (
			<div
				style={style}
				className="canvas-node canvas-node-agent"
				onMouseDown={(e) => onMouseDown(node.id, e)}
				onClick={() => onClick(node.id)}
			>
				<div className="node-header">
					<strong>{agentNode.agent.name}</strong>
					<span className="node-role">{agentNode.agent.role}</span>
				</div>
			</div>
		);
	}

	if (node.type === CanvasNodeType.NOTE) {
		const noteNode = node as NoteCanvasNode;
		return (
			<div
				style={style}
				className="canvas-node canvas-node-note"
				onMouseDown={(e) => onMouseDown(node.id, e)}
				onClick={() => onClick(node.id)}
			>
				<div className="node-header">
					<strong>{noteNode.noteTitle}</strong>
				</div>
			</div>
		);
	}

	return null;
};
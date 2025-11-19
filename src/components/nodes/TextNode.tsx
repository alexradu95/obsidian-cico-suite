/**
 * TextNode Component
 * Custom node renderer for text nodes in the Flow Canvas
 */

import * as React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export type TextNodeData = {
	text: string;
	color?: string;
};

/**
 * Custom text node component for Flow Canvas
 */
const TextNodeComponent = (props: NodeProps<TextNodeData>) => {
	const { data, selected } = props;
	const color = data.color || '4'; // Default to green

	console.log('[TextNode] Rendering:', { data, selected });

	return (
		<div
			className={`flow-text-node color-${color}`}
			style={{
				padding: '10px',
				borderRadius: '4px',
				border: `2px solid ${selected ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
				background: 'var(--background-primary-alt)',
				minWidth: '150px',
				minHeight: '50px',
				maxWidth: '400px',
				fontSize: '13px',
				lineHeight: '1.4',
				whiteSpace: 'pre-wrap',
				wordBreak: 'break-word',
			}}
		>
			{/* Handles for connections */}
			<Handle
				type="target"
				position={Position.Left}
				style={{
					background: 'var(--interactive-accent)',
					width: '8px',
					height: '8px',
				}}
			/>

			{/* Node content */}
			<div style={{ color: 'var(--text-normal)' }}>
				{data.text}
			</div>

			<Handle
				type="source"
				position={Position.Right}
				style={{
					background: 'var(--interactive-accent)',
					width: '8px',
					height: '8px',
				}}
			/>
		</div>
	);
};

export { TextNodeComponent as TextNode };

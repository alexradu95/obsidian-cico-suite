/**
 * CanvasCardMenu Component
 * Bottom toolbar matching Obsidian's canvas card menu design
 */

import * as React from 'react';

export type CanvasCardMenuProps = {
	/**
	 * Callback to switch to Canvas view
	 */
	onSwitchToCanvas?: () => void;
};

/**
 * Canvas card menu matching Obsidian's design
 * Shows drag-to-add buttons and switch view button at the bottom
 */
export const CanvasCardMenu = ({ onSwitchToCanvas }: CanvasCardMenuProps) => {
	return (
		<div className="canvas-card-menu" style={{ zIndex: 5 }}>
			{/* Drag to add card */}
			<div
				className="canvas-card-menu-button mod-draggable"
				aria-label="Drag to add card"
				data-tooltip-position="top"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="svg-icon lucide-sticky-note"
				>
					<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
					<path d="M15 3v4a2 2 0 0 0 2 2h4" />
				</svg>
			</div>

			{/* Drag to add note from vault */}
			<div
				className="canvas-card-menu-button mod-draggable"
				aria-label="Drag to add note from vault"
				data-tooltip-position="top"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="svg-icon lucide-file-text"
				>
					<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
					<path d="M14 2v4a2 2 0 0 0 2 2h4" />
					<path d="M10 9H8" />
					<path d="M16 13H8" />
					<path d="M16 17H8" />
				</svg>
			</div>

			{/* Drag to add media from vault */}
			<div
				className="canvas-card-menu-button mod-draggable"
				aria-label="Drag to add media from vault"
				data-tooltip-position="top"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="svg-icon lucide-file-image"
				>
					<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
					<path d="M14 2v4a2 2 0 0 0 2 2h4" />
					<circle cx="10" cy="12" r="2" />
					<path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
				</svg>
			</div>

			{/* Switch to Canvas button */}
			{onSwitchToCanvas && (
				<div
					className="canvas-card-menu-button canvas-flow-view-button"
					aria-label="Switch to Canvas"
					data-tooltip-position="top"
					onClick={onSwitchToCanvas}
					style={{ cursor: 'pointer' }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="svg-icon lucide-layout-grid"
					>
						<rect width="7" height="7" x="3" y="3" rx="1" />
						<rect width="7" height="7" x="14" y="3" rx="1" />
						<rect width="7" height="7" x="14" y="14" rx="1" />
						<rect width="7" height="7" x="3" y="14" rx="1" />
					</svg>
				</div>
			)}
		</div>
	);
};

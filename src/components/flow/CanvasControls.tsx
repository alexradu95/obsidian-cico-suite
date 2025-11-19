/**
 * CanvasControls Component
 * Custom controls matching Obsidian's canvas control design
 */

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * Custom canvas controls matching Obsidian's design
 */
export const CanvasControls = () => {
	const reactFlow = useReactFlow();
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const [snapToGrid, setSnapToGrid] = useState(false);
	const [snapToObject, setSnapToObject] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowSettingsMenu(false);
			}
		};

		if (showSettingsMenu) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [showSettingsMenu]);

	const handleZoomIn = () => {
		reactFlow.zoomIn();
	};

	const handleZoomOut = () => {
		reactFlow.zoomOut();
	};

	const handleResetZoom = () => {
		reactFlow.setViewport({ x: 0, y: 0, zoom: 1 });
	};

	const handleZoomToFit = () => {
		reactFlow.fitView({ padding: 0.2 });
	};

	return (
		<div className="canvas-controls" style={{ zIndex: 5 }}>
			{/* Settings button group */}
			<div className="canvas-control-group" ref={menuRef}>
				<div
					className={`canvas-control-item ${showSettingsMenu ? 'has-active-menu' : ''}`}
					aria-label="Canvas settings"
					data-tooltip-position="left"
					onClick={() => setShowSettingsMenu(!showSettingsMenu)}
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
						className="svg-icon lucide-settings"
					>
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</div>

				{/* Settings dropdown menu */}
				{showSettingsMenu && (
					<div className="canvas-settings-menu">
						<div
							className="canvas-settings-menu-item"
							onClick={() => setSnapToGrid(!snapToGrid)}
						>
							<div className="canvas-settings-menu-item-checkbox">
								{snapToGrid && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								)}
							</div>
							<div className="canvas-settings-menu-item-label">Snap to grid</div>
						</div>

						<div
							className="canvas-settings-menu-item"
							onClick={() => setSnapToObject(!snapToObject)}
						>
							<div className="canvas-settings-menu-item-checkbox">
								{snapToObject && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								)}
							</div>
							<div className="canvas-settings-menu-item-label">Snap to objects</div>
						</div>

						<div
							className="canvas-settings-menu-item"
							onClick={() => setReadOnly(!readOnly)}
						>
							<div className="canvas-settings-menu-item-checkbox">
								{readOnly && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								)}
							</div>
							<div className="canvas-settings-menu-item-label">Read-only</div>
						</div>
					</div>
				)}
			</div>

			{/* Zoom controls group */}
			<div className="canvas-control-group">
				<div
					className="canvas-control-item"
					aria-label="Zoom in"
					data-tooltip-position="left"
					onClick={handleZoomIn}
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
						className="svg-icon lucide-plus"
					>
						<path d="M5 12h14" />
						<path d="M12 5v14" />
					</svg>
				</div>
				<div
					className="canvas-control-item"
					aria-label="Reset zoom"
					data-tooltip-position="left"
					onClick={handleResetZoom}
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
						className="svg-icon lucide-rotate-cw"
					>
						<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
					</svg>
				</div>
				<div
					className="canvas-control-item"
					aria-label="Zoom to fit&#10;(Shift + 1)"
					data-tooltip-position="left"
					onClick={handleZoomToFit}
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
						className="svg-icon lucide-maximize"
					>
						<path d="M8 3H5a2 2 0 0 0-2 2v3" />
						<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
						<path d="M3 16v3a2 2 0 0 0 2 2h3" />
						<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
					</svg>
				</div>
				<div
					className="canvas-control-item"
					aria-label="Zoom out"
					data-tooltip-position="left"
					onClick={handleZoomOut}
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
						className="svg-icon lucide-minus"
					>
						<path d="M5 12h14" />
					</svg>
				</div>
			</div>

			{/* Undo/Redo controls group */}
			<div className="canvas-control-group">
				<div
					className="canvas-control-item is-disabled"
					aria-label="Undo"
					data-tooltip-position="left"
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
						className="svg-icon lucide-undo-2"
					>
						<path d="M9 14 4 9l5-5" />
						<path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
					</svg>
				</div>
				<div
					className="canvas-control-item is-disabled"
					aria-label="Redo"
					data-tooltip-position="left"
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
						className="svg-icon lucide-redo-2"
					>
						<path d="m15 14 5-5-5-5" />
						<path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
					</svg>
				</div>
			</div>

			{/* Help button group */}
			<div className="canvas-control-group">
				<div
					className="canvas-control-item"
					aria-label="Canvas help"
					data-tooltip-position="left"
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
						className="svg-icon lucide-help-circle"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<path d="M12 17h.01" />
					</svg>
				</div>
			</div>
		</div>
	);
};

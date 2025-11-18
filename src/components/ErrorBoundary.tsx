import { Component, ReactNode } from 'react';
import { Notice } from 'obsidian';

/**
 * Props for the ErrorBoundary component.
 *
 * @interface Props
 * @property {ReactNode} children - Child components to render
 * @property {ReactNode} [fallback] - Optional custom fallback UI to render on error
 */
interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 *
 * @interface State
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error} [error] - The caught error object
 */
interface State {
	hasError: boolean;
	error?: Error;
}

/**
 * React Error Boundary component for catching and handling errors in the component tree.
 * Prevents the entire plugin from crashing if a React component throws an error.
 * Displays a fallback UI and logs errors to the console.
 *
 * @class ErrorBoundary
 * @extends {Component<Props, State>}
 * @example
 * <ErrorBoundary fallback={<div>Error occurred</div>}>
 *   <AIAssistantView />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
	/**
	 * Creates an instance of ErrorBoundary.
	 *
	 * @param {Props} props - Component props
	 */
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	/**
	 * Static lifecycle method to update state when an error is thrown.
	 * Called when a descendant component throws an error.
	 *
	 * @static
	 * @param {Error} error - The error that was thrown
	 * @returns {State} New state with error information
	 */
	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	/**
	 * Lifecycle method called after an error has been thrown by a descendant component.
	 * Used for logging error information and showing notifications.
	 *
	 * @param {Error} error - The error that was thrown
	 * @param {any} errorInfo - Additional error information including component stack
	 * @returns {void}
	 */
	componentDidCatch(error: Error, errorInfo: any) {
		console.error('React Error Boundary caught error:', error, errorInfo);
		new Notice(`AI Assistant Error: ${error.message}`);
	}

	/**
	 * Renders either the children components or a fallback UI based on error state.
	 * If an error was caught, displays either the custom fallback or a default error UI.
	 *
	 * @returns {ReactNode} The rendered component tree or fallback UI
	 */
	render() {
		if (this.state.hasError) {
			return this.props.fallback || (
				<div style={{ padding: '20px', textAlign: 'center' }}>
					<h3>Something went wrong</h3>
					<p>{this.state.error?.message}</p>
					<button onClick={() => this.setState({ hasError: false })}>
						Try again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

import { Component, ReactNode } from 'react';
import { Notice } from 'obsidian';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		console.error('React Error Boundary caught error:', error, errorInfo);
		new Notice(`AI Assistant Error: ${error.message}`);
	}

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

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Notice, TFile } from 'obsidian';
import { useApp } from '../hooks/useApp';
import { PERSONALITY_PROMPTS, type Message } from '../types';

/**
 * Props for the AIAssistantView component.
 *
 * @interface AIAssistantViewProps
 * @property {() => void} [onClear] - Optional callback invoked when conversation is cleared
 */
interface AIAssistantViewProps {
	onClear?: () => void;
}

/**
 * Context information that is automatically loaded for the AI.
 */
interface ContextData {
	activeFile: string;
	content: string;
	previousContext: string;
	tabsContext: string;
}

/**
 * Represents a file that is part of the conversation context.
 */
interface ContextFile {
	path: string;
	name: string;
	content?: string;
}

/**
 * Main AI Assistant view component.
 * Provides a chat interface for interacting with the AI assistant, including:
 * - Chat history display with user/assistant messages
 * - Input field for sending messages
 * - Automatic context loading from active files and tabs
 * - Auto-scroll to latest messages
 *
 * @component
 * @param {AIAssistantViewProps} props - Component props
 * @returns {JSX.Element} The rendered assistant view
 * @example
 * <AIAssistantView onClear={() => console.log('Cleared')} />
 */
export const AIAssistantView = ({ onClear }: AIAssistantViewProps) => {
	const { app, plugin } = useApp();
	const [chatHistory, setChatHistory] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [contextData, setContextData] = useState<ContextData | null>(null);
	const [hasGreeted, setHasGreeted] = useState(false);
	const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
	const [showFileSuggestions, setShowFileSuggestions] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const conversationRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const aiService = useMemo(() => plugin.aiService, [plugin]);

	const loadContext = useCallback(async () => {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			setContextData(null);
			return;
		}

		try {
			const content = await app.vault.read(activeFile);
			const previousContext = await aiService.getPreviousDailyNotes();
			const tabsContext = await aiService.getOpenTabsContext();

			setContextData({
				activeFile: activeFile.basename,
				content: content.substring(0, 1000),
				previousContext,
				tabsContext
			});
		} catch (error) {
			console.error('Failed to load context:', error);
			setContextData(null);
		}
	}, [app, aiService]);

	// Load context on mount and when active file changes
	useEffect(() => {
		loadContext();

		// Register event listener for file changes
		const fileChangeHandler = () => {
			loadContext();
		};

		app.workspace.on('active-leaf-change', fileChangeHandler);

		// Cleanup
		return () => {
			app.workspace.off('active-leaf-change', fileChangeHandler);
		};
	}, [app.workspace, loadContext]);

	// Automatically provide greeting when context is first loaded
	useEffect(() => {
		if (contextData && !hasGreeted && chatHistory.length === 0) {
			setHasGreeted(true);
			provideInitialGreeting();
		}
	}, [contextData, hasGreeted, chatHistory.length]);

	const provideInitialGreeting = useCallback(async () => {
		if (!contextData) return;

		setIsLoading(true);
		const personalityPrompt = PERSONALITY_PROMPTS[plugin.settings.personality];

		const greetingPrompt: Message = {
			role: 'system',
			content: `${personalityPrompt}

Utilizatorul tocmai a deschis asistentul. Oferă o întrebare sau observație scurtă și relevantă bazată pe contextul curent.

Document activ: ${contextData.activeFile}
Conținut: ${contextData.content}

Context zile anterioare:
${contextData.previousContext}${contextData.tabsContext}`
		};

		try {
			const greeting = await aiService.callLMStudio([greetingPrompt]);
			setChatHistory([{ role: 'assistant', content: greeting }]);
		} catch (error: any) {
			console.error('Failed to get greeting:', error);
		} finally {
			setIsLoading(false);
		}
	}, [contextData, plugin.settings.personality, aiService]);

	// Handle adding a context file
	const addContextFile = useCallback(async (file: TFile) => {
		try {
			const content = await app.vault.read(file);
			const newFile: ContextFile = {
				path: file.path,
				name: file.basename,
				content: content.substring(0, 2000) // Limit content size
			};

			// Check if file is already in context
			if (!contextFiles.some(f => f.path === file.path)) {
				setContextFiles(prev => [...prev, newFile]);
			}
		} catch (error) {
			console.error('Failed to add context file:', error);
		}
	}, [app.vault, contextFiles]);

	// Handle removing a context file
	const removeContextFile = useCallback((path: string) => {
		setContextFiles(prev => prev.filter(f => f.path !== path));
	}, []);

	// Get file suggestions based on search query
	const getFileSuggestions = useCallback(() => {
		const files = app.vault.getMarkdownFiles();
		if (!searchQuery) {
			// Return recent files if no query
			return files.slice(0, 5);
		}
		// Filter files by query
		return files
			.filter(file =>
				file.basename.toLowerCase().includes(searchQuery.toLowerCase()) ||
				file.path.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.slice(0, 5);
	}, [app.vault, searchQuery]);

	// Handle @ mentions in input
	const handleInputChange = useCallback((value: string) => {
		setInputValue(value);

		// Check if user typed @ to show file suggestions
		const lastAtIndex = value.lastIndexOf('@');
		if (lastAtIndex >= 0 && lastAtIndex === value.length - 1) {
			setShowFileSuggestions(true);
			setSearchQuery('');
		} else if (lastAtIndex >= 0 && value.length > lastAtIndex + 1) {
			// Get the search query after @
			const query = value.substring(lastAtIndex + 1);
			// Check if query contains space (which would end the mention)
			if (!query.includes(' ')) {
				setSearchQuery(query);
				setShowFileSuggestions(true);
			} else {
				setShowFileSuggestions(false);
			}
		} else {
			setShowFileSuggestions(false);
		}
	}, []);

	// Handle selecting a file from suggestions
	const selectFileSuggestion = useCallback(async (file: TFile) => {
		// Remove the @ mention from input
		const lastAtIndex = inputValue.lastIndexOf('@');
		if (lastAtIndex >= 0) {
			setInputValue(inputValue.substring(0, lastAtIndex));
		}
		setShowFileSuggestions(false);
		setSearchQuery('');

		// Add the file to context
		await addContextFile(file);

		// Focus back on input
		inputRef.current?.focus();
	}, [inputValue, addContextFile]);

	const clearConversation = useCallback(() => {
		setChatHistory([]);
		setHasGreeted(false);
		setContextFiles([]); // Clear context files too
		new Notice('Conversație ștearsă');
		onClear?.();
		// Reload context and provide new greeting
		loadContext();
	}, [onClear, loadContext]);

	const addMessage = useCallback((role: string, content: string) => {
		const newMessage: Message = {
			role: role as 'system' | 'user' | 'assistant',
			content
		};
		setChatHistory(prev => [...prev, newMessage]);
	}, []);

	const sendMessage = useCallback(async () => {
		const message = inputValue.trim();
		if (!message) return;

		setIsLoading(true);

		const userMessage: Message = { role: 'user', content: message };
		const newHistory = [...chatHistory, userMessage];
		setChatHistory(newHistory);
		setInputValue('');

		// Add thinking message
		const thinkingMessage: Message = { role: 'system', content: '🤔 Mă gândesc...' };
		setChatHistory([...newHistory, thinkingMessage]);

		try {
			// Create messages with context
			const personalityPrompt = PERSONALITY_PROMPTS[plugin.settings.personality];
			const contextualHistory: Message[] = [];

			// Build context prompt
			let contextPrompt = personalityPrompt;

			// Add context files if any
			if (contextFiles.length > 0) {
				contextPrompt += '\n\nFișiere în context:';
				for (const file of contextFiles) {
					contextPrompt += `\n\nFișier: ${file.name}\nConținut:\n${file.content}`;
				}
			}

			// Add system prompt with context if available
			if (contextData) {
				contextualHistory.push({
					role: 'system',
					content: `${contextPrompt}

Context actual:
Document activ: ${contextData.activeFile}
Conținut: ${contextData.content}

Context zile anterioare:
${contextData.previousContext}${contextData.tabsContext}

Răspunde la întrebarea utilizatorului având în vedere contextul de mai sus.`
				});
			} else {
				contextualHistory.push({
					role: 'system',
					content: contextPrompt
				});
			}

			// Add conversation history (excluding system messages)
			contextualHistory.push(...newHistory.filter(m => m.role !== 'system'));

			const response = await aiService.callLMStudio(contextualHistory);

			// Remove thinking message and add response
			setChatHistory(prev => {
				const withoutThinking = prev.filter(m => m.content !== '🤔 Mă gândesc...');
				return [...withoutThinking, { role: 'assistant', content: response }];
			});
		} catch (error: any) {
			// Remove thinking message and add error
			setChatHistory(prev => {
				const withoutThinking = prev.filter(m => m.content !== '🤔 Mă gândesc...');
				return [...withoutThinking, { role: 'system', content: 'Eroare: ' + error.message }];
			});
		} finally {
			setIsLoading(false);
		}
	}, [inputValue, chatHistory, aiService, contextData, plugin.settings.personality]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (conversationRef.current) {
			conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
		}
	}, [chatHistory]);

	return (
		<>
			<div className="ai-conversation-area" ref={conversationRef}>
				{chatHistory.map((message, index) => (
					<div key={index} className={`ai-message ai-message-${message.role}`}>
						<span className="ai-message-icon">
							{message.role === 'assistant' ? '🤖' : message.role === 'user' ? '👤' : 'ℹ️'}
						</span>
						<span className="ai-message-content">{message.content}</span>
					</div>
				))}
			</div>

			{isLoading && <div className="ai-loading">⏳ Se încarcă...</div>}

			<div className="ai-input-container">
				{/* Context Files Display */}
				{contextFiles.length > 0 && (
					<div className="ai-context-files">
						{contextFiles.map(file => (
							<div key={file.path} className="ai-context-file">
								<span className="ai-context-file-name">📄 {file.name}</span>
								<button
									className="ai-context-file-remove"
									onClick={() => removeContextFile(file.path)}
									title="Remove from context"
								>
									×
								</button>
							</div>
						))}
					</div>
				)}

				{/* File Suggestions Dropdown */}
				{showFileSuggestions && (
					<div className="ai-file-suggestions">
						{getFileSuggestions().map(file => (
							<div
								key={file.path}
								className="ai-file-suggestion"
								onClick={() => selectFileSuggestion(file)}
							>
								<span className="ai-suggestion-icon">📄</span>
								<span className="ai-suggestion-name">{file.basename}</span>
								<span className="ai-suggestion-path">{file.path}</span>
							</div>
						))}
						{getFileSuggestions().length === 0 && (
							<div className="ai-file-suggestion-empty">
								Nu s-au găsit fișiere
							</div>
						)}
					</div>
				)}

				<textarea
					ref={inputRef}
					value={inputValue}
					onChange={(e) => handleInputChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Întreabă-mă ceva... (folosește @ pentru a adăuga fișiere)"
					rows={2}
					disabled={isLoading}
				/>
				<div className="ai-button-container">
					<button
						className="ai-btn-send"
						onClick={sendMessage}
						disabled={isLoading || !inputValue.trim()}
					>
						Trimite
					</button>
					<button
						className="ai-btn-clear"
						onClick={clearConversation}
						disabled={isLoading}
					>
						Șterge
					</button>
				</div>
			</div>
		</>
	);
};
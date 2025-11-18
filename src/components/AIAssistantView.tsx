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
	isCurrentTab?: boolean; // True if this is the current active file
	isEnabled?: boolean; // Whether the file is enabled in context (for current tab)
	isPastDailyNote?: boolean; // True if this is a past daily note
	isFutureDailyNote?: boolean; // True if this is a future daily note
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
	const [pastDays, setPastDays] = useState(plugin.settings.pastDailyNotesInContext);
	const [futureDays, setFutureDays] = useState(plugin.settings.futureDailyNotesInContext);
	const [showContextControls, setShowContextControls] = useState(false);
	const conversationRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const aiService = useMemo(() => plugin.aiService, [plugin]);

	const loadContext = useCallback(async () => {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			setContextData(null);
			// Remove current tab and daily notes from context files
			setContextFiles(prev => prev.filter(f => !f.isCurrentTab && !f.isPastDailyNote && !f.isFutureDailyNote));
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

			// Add or update current tab in context files
			const currentTabFile: ContextFile = {
				path: activeFile.path,
				name: activeFile.basename,
				content: content.substring(0, 2000),
				isCurrentTab: true,
				isEnabled: true // Enabled by default
			};

			// Check if current file is a daily note
			const isDailyNote = aiService.isDailyNote(activeFile);
			let pastDailyNotes: ContextFile[] = [];
			let futureDailyNotes: ContextFile[] = [];

			if (isDailyNote) {
				const files = app.vault.getMarkdownFiles();
				const allDailyNotes = files
					.filter(f => aiService.isDailyNote(f))
					.filter(f => f.path !== activeFile.path) // Exclude current file
					.sort((a, b) => a.basename.localeCompare(b.basename)); // Sort chronologically

				// Split into past and future notes based on current file
				const currentDate = activeFile.basename;
				const pastNotes = allDailyNotes.filter(f => f.basename < currentDate).reverse(); // Most recent first
				const futureNotes = allDailyNotes.filter(f => f.basename > currentDate);

				// Load past daily notes
				if (pastDays > 0) {
					const notesToLoad = pastNotes.slice(0, pastDays);
					for (const note of notesToLoad) {
						const noteContent = await app.vault.read(note);
						pastDailyNotes.push({
							path: note.path,
							name: note.basename,
							content: noteContent.substring(0, 1000),
							isPastDailyNote: true,
							isEnabled: true
						});
					}
				}

				// Load future daily notes
				if (futureDays > 0) {
					const notesToLoad = futureNotes.slice(0, futureDays);
					for (const note of notesToLoad) {
						const noteContent = await app.vault.read(note);
						futureDailyNotes.push({
							path: note.path,
							name: note.basename,
							content: noteContent.substring(0, 1000),
							isFutureDailyNote: true,
							isEnabled: true
						});
					}
				}
			}

			setContextFiles(prev => {
				// Remove old current tab and daily notes, keep manually added files
				const manualFiles = prev.filter(f => !f.isCurrentTab && !f.isPastDailyNote && !f.isFutureDailyNote);
				// Return current tab first, then past daily notes, future daily notes, then manual files
				return [currentTabFile, ...pastDailyNotes, ...futureDailyNotes, ...manualFiles];
			});
		} catch (error) {
			console.error('Failed to load context:', error);
			setContextData(null);
			// Remove current tab and daily notes from context files on error
			setContextFiles(prev => prev.filter(f => !f.isCurrentTab && !f.isPastDailyNote && !f.isFutureDailyNote));
		}
	}, [app, aiService, pastDays, futureDays]);

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
		if (contextData && !hasGreeted && chatHistory.length === 0 && contextFiles.length > 0) {
			setHasGreeted(true);
			provideInitialGreeting();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contextData, hasGreeted, chatHistory.length]);

	const provideInitialGreeting = useCallback(async () => {
		if (!contextData) return;

		setIsLoading(true);
		const personalityPrompt = PERSONALITY_PROMPTS[plugin.settings.personality];

		// Check if current tab is enabled
		const currentTab = contextFiles.find(f => f.isCurrentTab);
		const isCurrentTabEnabled = currentTab ? currentTab.isEnabled : true;

		let greetingContent = `${personalityPrompt}\n\nUtilizatorul tocmai a deschis asistentul. Oferă o întrebare sau observație scurtă și relevantă bazată pe contextul curent.`;

		// Only include current document if it's enabled
		if (isCurrentTabEnabled && currentTab) {
			greetingContent += `\n\nDocument activ: ${currentTab.name}\nConținut: ${currentTab.content}`;
		}

		// Include past daily notes if any
		const pastDailyNotes = contextFiles.filter(f => f.isPastDailyNote);
		if (pastDailyNotes.length > 0) {
			greetingContent += '\n\nZile anterioare în context:';
			for (const note of pastDailyNotes) {
				greetingContent += `\n\nFișier: ${note.name}\nConținut: ${note.content}`;
			}
		}

		// Include future daily notes if any
		const futureDailyNotes = contextFiles.filter(f => f.isFutureDailyNote);
		if (futureDailyNotes.length > 0) {
			greetingContent += '\n\nZile viitoare în context:';
			for (const note of futureDailyNotes) {
				greetingContent += `\n\nFișier: ${note.name}\nConținut: ${note.content}`;
			}
		}

		// Always include previous days context if available (for other days not shown)
		if (contextData.previousContext) {
			greetingContent += `\n\nAlte zile anterioare:\n${contextData.previousContext}`;
		}

		// Only include tabs context if current tab is enabled (since tabs context includes current file)
		if (contextData.tabsContext && isCurrentTabEnabled) {
			greetingContent += `\n\nTab-uri deschise:${contextData.tabsContext}`;
		}

		const greetingPrompt: Message = {
			role: 'system',
			content: greetingContent
		};

		try {
			const greeting = await aiService.callLMStudio([greetingPrompt]);
			setChatHistory([{ role: 'assistant', content: greeting }]);
		} catch (error: any) {
			console.error('Failed to get greeting:', error);
		} finally {
			setIsLoading(false);
		}
	}, [contextData, contextFiles, plugin.settings.personality, aiService]);

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

	// Handle removing a context file (only for manually added files, not current tab or daily notes)
	const removeContextFile = useCallback((path: string) => {
		setContextFiles(prev => prev.filter(f => f.path !== path || f.isCurrentTab || f.isPastDailyNote || f.isFutureDailyNote));
	}, []);

	// Toggle current tab enabled/disabled state
	const toggleCurrentTab = useCallback(() => {
		setContextFiles(prev => prev.map(f =>
			f.isCurrentTab
				? { ...f, isEnabled: !f.isEnabled }
				: f
		));
	}, []);

	// Handle changing past days
	const handlePastDaysChange = useCallback(async (value: number) => {
		setPastDays(value);
		// Save to plugin settings
		plugin.settings.pastDailyNotesInContext = value;
		await plugin.saveSettings();
		// Reload context with new value
		loadContext();
	}, [plugin, loadContext]);

	// Handle changing future days
	const handleFutureDaysChange = useCallback(async (value: number) => {
		setFutureDays(value);
		// Save to plugin settings
		plugin.settings.futureDailyNotesInContext = value;
		await plugin.saveSettings();
		// Reload context with new value
		loadContext();
	}, [plugin, loadContext]);

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
		// Only keep the current tab and daily notes, remove manually added files
		setContextFiles(prev => prev.filter(f => f.isCurrentTab || f.isPastDailyNote || f.isFutureDailyNote));
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

			// Add context files if any (only enabled ones, daily notes are always enabled)
			const enabledFiles = contextFiles.filter(f =>
				f.isPastDailyNote || f.isFutureDailyNote || // Daily notes are always enabled
				(!f.isCurrentTab || f.isEnabled) // Other files must be enabled
			);
			if (enabledFiles.length > 0) {
				contextPrompt += '\n\nFișiere în context:';
				for (const file of enabledFiles) {
					const fileType = file.isPastDailyNote ? ' (zi anterioară)' :
									file.isFutureDailyNote ? ' (zi viitoare)' : '';
					contextPrompt += `\n\nFișier: ${file.name}${fileType}\nConținut:\n${file.content}`;
				}
			}

			// Check if current tab is disabled in context files
			const currentTabDisabled = contextFiles.some(f => f.isCurrentTab && !f.isEnabled);

			// Always add previous days context if available
			if (contextData && contextData.previousContext) {
				contextPrompt += '\n\nContext zile anterioare:';
				contextPrompt += `\n${contextData.previousContext}`;
			}

			// Only add tabs context if current tab is enabled (since tabs context includes current file)
			if (contextData && contextData.tabsContext && !currentTabDisabled) {
				contextPrompt += '\n\nTab-uri deschise:';
				contextPrompt += `${contextData.tabsContext}`;
			}

			contextualHistory.push({
				role: 'system',
				content: contextPrompt + '\n\nRăspunde la întrebarea utilizatorului având în vedere contextul de mai sus.'
			});

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
				{/* Context Frame Controls - Only show when viewing a daily note */}
				{contextFiles.some(f => f.isCurrentTab) &&
				 app.workspace.getActiveFile() &&
				 aiService.isDailyNote(app.workspace.getActiveFile()) && (
					<div className="ai-context-frame">
						<div className="ai-context-frame-header">
							<span>📅 Context Frame</span>
							<button
								className="ai-context-frame-toggle"
								onClick={() => setShowContextControls(!showContextControls)}
							>
								{showContextControls ? '▼' : '▶'}
							</button>
						</div>
						{showContextControls && (
							<div className="ai-context-frame-controls">
								<div className="ai-context-frame-control">
									<label>Past days: {pastDays}</label>
									<input
										type="range"
										min="0"
										max="7"
										value={pastDays}
										onChange={(e) => handlePastDaysChange(parseInt(e.target.value))}
										className="ai-context-slider"
									/>
								</div>
								<div className="ai-context-frame-control">
									<label>Future days: {futureDays}</label>
									<input
										type="range"
										min="0"
										max="7"
										value={futureDays}
										onChange={(e) => handleFutureDaysChange(parseInt(e.target.value))}
										className="ai-context-slider"
									/>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Context Files Display */}
				{contextFiles.length > 0 && (
					<div className="ai-context-files">
						{contextFiles.map(file => (
							<div
								key={file.path}
								className={`ai-context-file ${
									file.isCurrentTab ? 'ai-context-file-current' : ''
								} ${
									file.isPastDailyNote ? 'ai-context-file-daily-past' : ''
								} ${
									file.isFutureDailyNote ? 'ai-context-file-daily-future' : ''
								} ${
									file.isCurrentTab && !file.isEnabled ? 'ai-context-file-disabled' : ''
								}`}
							>
								<span className="ai-context-file-name">
									{file.isCurrentTab ? '📋' :
									 file.isPastDailyNote ? '📅' :
									 file.isFutureDailyNote ? '📆' : '📄'} {file.name}
									{file.isCurrentTab && <span className="ai-context-file-badge">Current</span>}
									{file.isPastDailyNote && <span className="ai-context-file-badge ai-context-file-badge-past">Past</span>}
									{file.isFutureDailyNote && <span className="ai-context-file-badge ai-context-file-badge-future">Future</span>}
								</span>
								{file.isCurrentTab ? (
									<button
										className="ai-context-file-toggle"
										onClick={toggleCurrentTab}
										title={file.isEnabled ? 'Disable in context' : 'Enable in context'}
									>
										{file.isEnabled ? '✓' : '○'}
									</button>
								) : (file.isPastDailyNote || file.isFutureDailyNote) ? (
									// Daily notes don't have any action button
									null
								) : (
									<button
										className="ai-context-file-remove"
										onClick={() => removeContextFile(file.path)}
										title="Remove from context"
									>
										×
									</button>
								)}
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
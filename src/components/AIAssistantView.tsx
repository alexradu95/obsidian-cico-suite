import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Notice } from 'obsidian';
import { useApp } from '../hooks/useApp';
import { PERSONALITY_PROMPTS, type Message } from '../types';

interface AIAssistantViewProps {
	onClear?: () => void;
}

export const AIAssistantView = ({ onClear }: AIAssistantViewProps) => {
	const { app, plugin } = useApp();
	const [chatHistory, setChatHistory] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [contextInfo, setContextInfo] = useState('');
	const conversationRef = useRef<HTMLDivElement>(null);

	const aiService = useMemo(() => plugin.aiService, [plugin]);

	const updateContextInfo = useCallback(() => {
		const activeFile = app.workspace.getActiveFile();
		if (activeFile) {
			const openTabs = app.workspace.getLeavesOfType('markdown').length;
			setContextInfo(`📄 ${activeFile.basename} | 📑 ${openTabs} tabs deschise`);
		}
	}, [app]);

	useEffect(() => {
		updateContextInfo();
	}, [updateContextInfo]);

	const clearConversation = useCallback(() => {
		setChatHistory([]);
		new Notice('Conversație ștearsă');
		onClear?.();
	}, [onClear]);

	const addMessage = useCallback((role: string, content: string) => {
		const newMessage: Message = {
			role: role as 'system' | 'user' | 'assistant',
			content
		};
		setChatHistory(prev => [...prev, newMessage]);
	}, []);

	const analyzeCurrentDocument = useCallback(async () => {
		const activeFile = app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file');
			return;
		}

		const content = await app.vault.read(activeFile);
		if (content.trim().length < 50) {
			addMessage('system', 'Document prea scurt. Scrie mai întâi ceva!');
			return;
		}

		setIsLoading(true);
		updateContextInfo();

		const previousContext = await aiService.getPreviousDailyNotes();
		const tabsContext = await aiService.getOpenTabsContext();
		const personalityPrompt = PERSONALITY_PROMPTS[plugin.settings.personality];

		const analysisPrompt: Message = {
			role: 'system',
			content: `${personalityPrompt}

Analizează documentul curent și oferă observații sau întrebări pentru reflecție.

Document curent: ${activeFile.basename}
Conținut: ${content.substring(0, 1000)}

Context zile anterioare:
${previousContext}${tabsContext}`
		};

		const newHistory = [analysisPrompt];
		setChatHistory(newHistory);

		try {
			const insight = await aiService.callLMStudio([analysisPrompt]);
			addMessage('assistant', insight);
		} catch (error: any) {
			new Notice('Eroare: ' + error.message);
			addMessage('system', 'Eroare: ' + error.message);
		} finally {
			setIsLoading(false);
		}
	}, [app, aiService, plugin.settings.personality, updateContextInfo, addMessage]);

	const sendMessage = useCallback(async () => {
		const message = inputValue.trim();
		if (!message) return;

		setIsLoading(true);
		updateContextInfo();

		const userMessage: Message = { role: 'user', content: message };
		const newHistory = [...chatHistory, userMessage];
		setChatHistory(newHistory);
		setInputValue('');

		// Add thinking message
		const thinkingMessage: Message = { role: 'system', content: '🤔 Mă gândesc...' };
		setChatHistory([...newHistory, thinkingMessage]);

		try {
			const response = await aiService.callLMStudio(newHistory);
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
	}, [inputValue, chatHistory, aiService, updateContextInfo]);

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
			<div className="ai-context-info">{contextInfo}</div>

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
				<textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Întreabă-mă ceva..."
					rows={2}
					disabled={isLoading}
				/>
				<div className="ai-button-container">
					<button
						className="ai-btn-send"
						onClick={sendMessage}
						disabled={isLoading}
					>
						Trimite
					</button>
					<button
						className="ai-btn-analyze"
						onClick={analyzeCurrentDocument}
						disabled={isLoading}
					>
						Analizează
					</button>
				</div>
			</div>
		</>
	);
};

import { useState, useEffect, useRef } from 'react';
import { Notice } from 'obsidian';
import { useApp } from '../hooks/useApp';

interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

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

	useEffect(() => {
		updateContextInfo();
	}, []);

	const updateContextInfo = () => {
		const activeFile = app.workspace.getActiveFile();
		if (activeFile) {
			const openTabs = app.workspace.getLeavesOfType('markdown').length;
			setContextInfo(`📄 ${activeFile.basename} | 📑 ${openTabs} tabs deschise`);
		}
	};

	const clearConversation = () => {
		setChatHistory([]);
		new Notice('Conversație ștearsă');
		onClear?.();
	};

	const addMessage = (role: string, content: string) => {
		const newMessage: Message = {
			role: role as 'system' | 'user' | 'assistant',
			content
		};
		setChatHistory(prev => [...prev, newMessage]);
	};

	const analyzeCurrentDocument = async () => {
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

		const previousContext = await plugin.getPreviousDailyNotes();
		const tabsContext = await plugin.getOpenTabsContext();
		const personalityPrompts: Record<string, string> = {
			concise: `Ești un asistent de jurnal direct și concis. Vorbește în limba română.
Răspunde scurt (1-2 propoziții). Pune o întrebare clară sau fă o observație specifică.
Fără limbaj poetic. Concentrează-te pe: sport/sală, dezvoltare personală, relaxare, obiceiuri zilnice.`,
			balanced: `Ești un asistent de jurnal prietenos și gânditor. Vorbește în limba română.
Oferă observații sau întrebări concise (2-3 propoziții). Fii cald dar nu prea verbos.
Concentrează-te pe: sport/sală (ce ai făcut, cum te-ai simțit), dezvoltare personală (ce ai învățat/lucrat azi),
relaxare (cum te destresezi), și pattern-uri între ziua curentă și zilele anterioare.`,
			reflective: `Ești un asistent de jurnal gânditor, ca un psiholog AI. Vorbește în limba română.
Oferă insight-uri profunde și întrebări semnificative pentru reflecție (3-4 propoziții).
Analizează: exercițiu fizic (ai fost la sală? ce ai făcut? cum te-ai simțit?),
dezvoltare personală (ai învățat ceva nou? ai lucrat la proiecte personale?),
relaxare și auto-îngrijire (cum te-ai destins? ce te-a ajutat?).
Compară cu zilele anterioare pentru a identifica pattern-uri și progress.`,
			poetic: `Ești un asistent de jurnal creativ și expresiv. Vorbește în limba română.
Folosește limbaj viu și metafore pentru a ajuta utilizatorul să reflecteze.
Explorează: exercițiul fizic (sala, mișcarea, cum simte corpul),
dezvoltarea sa (învățare, creștere, proiecte), relaxarea (cum își reîncarcă bateriile).
Fii cald, încurajator, și ajută-l să vadă conexiuni mai profunde între experiențele zilnice.`
		};
		const personalityPrompt = personalityPrompts[plugin.settings.personality];

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
			const insight = await plugin.callLMStudio([analysisPrompt]);
			addMessage('assistant', insight);
		} catch (error: any) {
			new Notice('Eroare: ' + error.message);
			addMessage('system', 'Eroare: ' + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const sendMessage = async () => {
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
			const response = await plugin.callLMStudio(newHistory);
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
	};

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

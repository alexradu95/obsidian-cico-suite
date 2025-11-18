/**
 * Represents a chat message in the conversation between the user and the AI assistant.
 *
 * @interface Message
 * @property {'system' | 'user' | 'assistant'} role - The role of the message sender
 *   - 'system': System prompts that define the assistant's behavior
 *   - 'user': Messages from the user
 *   - 'assistant': Responses from the AI assistant
 * @property {string} content - The text content of the message
 */
export interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

/**
 * Personality presets that control the assistant's communication style.
 * Each preset has a corresponding system prompt in PERSONALITY_PROMPTS.
 *
 * @type {'concise' | 'balanced' | 'reflective' | 'poetic'}
 * - 'concise': Direct and brief responses (1-2 sentences)
 * - 'balanced': Friendly and thoughtful (2-3 sentences)
 * - 'reflective': Deep insights like a psychologist (3-4 sentences)
 * - 'poetic': Creative and expressive with metaphors
 */
export type PersonalityPreset = 'concise' | 'balanced' | 'reflective' | 'poetic';

/**
 * Configuration settings for the Daily AI Assistant plugin.
 * These settings are persisted and can be modified through the settings tab.
 *
 * @interface DailyAIAssistantSettings
 */
export interface DailyAIAssistantSettings {
	/** Base URL for the LM Studio API endpoint (default: 'http://localhost:1234/v1') */
	lmStudioUrl: string;
	/** Name/ID of the AI model to use for chat completions */
	modelName: string;
	/** Whether to automatically show the assistant when opening a daily note */
	autoShowOnDailyNote: boolean;
	/** Number of previous daily notes to include as context (default: 7) */
	daysOfContext: number;
	/** Maximum tokens for AI responses (default: 150) */
	maxTokens: number;
	/** Temperature for AI generation (0-1, higher = more creative, default: 0.7) */
	temperature: number;
	/** The personality preset for the assistant's responses */
	personality: PersonalityPreset;
	/** Whether to include context from all open tabs in the workspace */
	includeOpenTabs: boolean;
}

/**
 * Default configuration values for the plugin.
 * These values are used when the plugin is first installed or when settings are reset.
 *
 * @const {DailyAIAssistantSettings}
 */
export const DEFAULT_SETTINGS: DailyAIAssistantSettings = {
	lmStudioUrl: 'http://localhost:1234/v1',
	modelName: '',
	autoShowOnDailyNote: true,
	daysOfContext: 7,
	maxTokens: 150,
	temperature: 0.7,
	personality: 'concise',
	includeOpenTabs: true
};

/**
 * Unique identifier for the AI Assistant sidebar view.
 * Used to register and identify the view type in Obsidian's workspace.
 *
 * @const {string}
 */
export const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-sidebar';

/**
 * System prompts for each personality preset.
 * These prompts define the AI assistant's behavior and communication style.
 * All prompts are in Romanian and focus on journaling, exercise, personal development, and relaxation.
 *
 * @const {Record<PersonalityPreset, string>}
 * @property {string} concise - Direct and brief assistant (1-2 sentences)
 * @property {string} balanced - Friendly and thoughtful assistant (2-3 sentences)
 * @property {string} reflective - Psychologist-like deep insights (3-4 sentences)
 * @property {string} poetic - Creative and expressive with metaphors
 */
export const PERSONALITY_PROMPTS: Record<PersonalityPreset, string> = {
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

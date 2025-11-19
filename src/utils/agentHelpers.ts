import { Agent, AgentRole } from '../types/agent';
import { PersonalityPreset, PERSONALITY_PROMPTS } from '../types';

/**
 * Options for creating a custom agent
 */
export interface CreateAgentOptions {
	/** Agent name (required) */
	name: string;
	/** Agent role (defaults to GENERAL) */
	role?: AgentRole;
	/** Personality preset (defaults to 'balanced') */
	personality?: PersonalityPreset;
	/** Custom system prompt (defaults to personality prompt) */
	systemPrompt?: string;
	/** Whether agent is active (defaults to true) */
	isActive?: boolean;
}

/**
 * Creates a default agent with standard configuration
 * Useful when initializing multi-agent mode for the first time
 *
 * @returns {Agent} A new default agent
 */
export const createDefaultAgent = (): Agent => {
	const personality: PersonalityPreset = 'balanced';
	const now = new Date();

	return {
		id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		name: 'Default Assistant',
		role: AgentRole.GENERAL,
		personality,
		systemPrompt: PERSONALITY_PROMPTS[personality],
		isActive: true,
		createdAt: now,
		lastActiveAt: now
	};
};

/**
 * Creates a custom agent with provided options
 *
 * @param {CreateAgentOptions} options - Configuration for the new agent
 * @returns {Agent} A new agent with the specified configuration
 */
export const createAgent = (options: CreateAgentOptions): Agent => {
	const personality = options.personality || 'balanced';
	const now = new Date();

	return {
		id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		name: options.name,
		role: options.role || AgentRole.GENERAL,
		personality,
		systemPrompt: options.systemPrompt || PERSONALITY_PROMPTS[personality],
		isActive: options.isActive !== undefined ? options.isActive : true,
		createdAt: now,
		lastActiveAt: now
	};
};

/**
 * Ensures there is at least one agent in the provided array
 * If the array is empty or undefined, creates and returns a default agent
 *
 * @param {Agent[] | undefined} agents - Existing agents array
 * @returns {Agent[]} Array with at least one agent
 */
export const ensureAtLeastOneAgent = (agents: Agent[] | undefined): Agent[] => {
	if (!agents || agents.length === 0) {
		return [createDefaultAgent()];
	}
	return agents;
};
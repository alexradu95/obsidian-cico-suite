import { Agent, AgentMessage } from '../types/agent';
import { AIService } from './AIService';
import { PERSONALITY_PROMPTS } from '../types/index';

/**
 * Service for managing agents and routing messages between them
 */
export class AgentService {
  private agents: Map<string, Agent> = new Map();
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Register a new agent in the system
   */
  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} already exists`);
    }
    this.agents.set(agent.id, agent);
  }

  /**
   * Unregister an agent from the system
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Get all registered agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get a specific agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Process a message for a specific agent
   */
  async processMessage(message: AgentMessage): Promise<string> {
    const agent = this.agents.get(message.agentId);

    if (!agent) {
      throw new Error(`Agent with ID ${message.agentId} not found`);
    }

    // Update agent last active time
    agent.lastActiveAt = new Date();

    // Prepare messages for AI service
    const systemPrompt = agent.systemPrompt || PERSONALITY_PROMPTS[agent.personality];
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: message.role, content: message.content }
    ];

    // Call AI service
    return await this.aiService.callLMStudio(messages);
  }
}
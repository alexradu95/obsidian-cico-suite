import { describe, it, expect, beforeEach } from 'vitest';
import { AgentService } from './AgentService';
import { Agent, AgentRole, AgentMessage } from '../types/agent';
import { AIService } from './AIService';

// Mock AIService
const mockAIService = {
  callLMStudio: async (messages: any[]) => 'Mock AI response',
  updateSettings: () => {},
  isDailyNote: () => false,
  getOpenTabsContext: async () => '',
  getPreviousDailyNotes: async () => ''
} as unknown as AIService;

describe('AgentService', () => {
  let agentService: AgentService;
  let testAgent: Agent;

  beforeEach(() => {
    agentService = new AgentService(mockAIService);
    testAgent = {
      id: 'agent-1',
      name: 'Test Agent',
      role: AgentRole.GENERAL,
      personality: 'balanced',
      systemPrompt: 'You are a helpful test agent',
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
  });

  describe('agent registration', () => {
    it('should register a new agent', () => {
      agentService.registerAgent(testAgent);

      const agents = agentService.getAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('agent-1');
      expect(agents[0].name).toBe('Test Agent');
    });

    it('should not allow duplicate agent IDs', () => {
      agentService.registerAgent(testAgent);

      expect(() => agentService.registerAgent(testAgent)).toThrow('Agent with ID agent-1 already exists');
    });
  });

  describe('agent management', () => {
    beforeEach(() => {
      agentService.registerAgent(testAgent);
    });

    it('should unregister an agent', () => {
      agentService.unregisterAgent('agent-1');

      const agents = agentService.getAgents();
      expect(agents).toHaveLength(0);
    });

    it('should get agent by ID', () => {
      const agent = agentService.getAgent('agent-1');

      expect(agent).toBeDefined();
      expect(agent!.id).toBe('agent-1');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = agentService.getAgent('non-existent');

      expect(agent).toBeUndefined();
    });
  });

  describe('message routing', () => {
    beforeEach(() => {
      agentService.registerAgent(testAgent);
    });

    it('should process message for a specific agent', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello agent!',
        agentId: 'agent-1',
        timestamp: new Date()
      };

      const response = await agentService.processMessage(message);

      expect(response).toBe('Mock AI response');
    });

    it('should throw error for message to non-existent agent', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello!',
        agentId: 'non-existent',
        timestamp: new Date()
      };

      await expect(agentService.processMessage(message)).rejects.toThrow('Agent with ID non-existent not found');
    });

    it('should update agent last active time when processing message', async () => {
      const originalTime = new Date(testAgent.lastActiveAt.getTime() - 1000); // 1 second earlier
      testAgent.lastActiveAt = originalTime;

      const message: AgentMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello!',
        agentId: 'agent-1',
        timestamp: new Date()
      };

      await agentService.processMessage(message);

      const agent = agentService.getAgent('agent-1');
      expect(agent!.lastActiveAt.getTime()).toBeGreaterThan(originalTime.getTime());
    });
  });
});
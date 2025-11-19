import { describe, it, expect } from 'vitest';
import { createDefaultAgent, createAgent, ensureAtLeastOneAgent } from './agentHelpers';
import { AgentRole, Agent } from '../types/agent';

describe('Agent Helpers', () => {
  describe('createDefaultAgent', () => {
    it('should create a default agent with correct properties', () => {
      const agent = createDefaultAgent();

      expect(agent.id).toBeDefined();
      expect(agent.id).toContain('agent-');
      expect(agent.name).toBe('Default Assistant');
      expect(agent.role).toBe(AgentRole.GENERAL);
      expect(agent.personality).toBe('balanced');
      expect(agent.isActive).toBe(true);
      expect(agent.systemPrompt).toBeDefined();
      expect(agent.createdAt).toBeInstanceOf(Date);
      expect(agent.lastActiveAt).toBeInstanceOf(Date);
    });

    it('should create agents with unique IDs', () => {
      const agent1 = createDefaultAgent();
      const agent2 = createDefaultAgent();

      expect(agent1.id).not.toBe(agent2.id);
    });
  });

  describe('createAgent', () => {
    it('should create an agent with provided properties', () => {
      const agent = createAgent({
        name: 'Custom Agent',
        role: AgentRole.SPECIALIST,
        personality: 'concise'
      });

      expect(agent.name).toBe('Custom Agent');
      expect(agent.role).toBe(AgentRole.SPECIALIST);
      expect(agent.personality).toBe('concise');
      expect(agent.id).toBeDefined();
      expect(agent.isActive).toBe(true);
    });

    it('should use default values for omitted properties', () => {
      const agent = createAgent({
        name: 'Test Agent'
      });

      expect(agent.role).toBe(AgentRole.GENERAL);
      expect(agent.personality).toBe('balanced');
      expect(agent.isActive).toBe(true);
    });

    it('should use custom system prompt if provided', () => {
      const customPrompt = 'Custom system prompt';
      const agent = createAgent({
        name: 'Test',
        systemPrompt: customPrompt
      });

      expect(agent.systemPrompt).toBe(customPrompt);
    });
  });

  describe('ensureAtLeastOneAgent', () => {
    it('should return existing agents if array is not empty', () => {
      const existingAgents: Agent[] = [
        createDefaultAgent(),
        createDefaultAgent()
      ];

      const result = ensureAtLeastOneAgent(existingAgents);

      expect(result).toHaveLength(2);
      expect(result).toEqual(existingAgents);
    });

    it('should create a default agent if array is empty', () => {
      const result = ensureAtLeastOneAgent([]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Default Assistant');
    });

    it('should create a default agent if array is undefined', () => {
      const result = ensureAtLeastOneAgent(undefined);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Default Assistant');
    });
  });
});
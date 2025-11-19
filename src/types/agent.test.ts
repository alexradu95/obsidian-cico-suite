import { describe, it, expect } from 'vitest';
import { Agent, AgentMessage, AgentRole } from './agent';

describe('Agent Types', () => {
  describe('Agent interface', () => {
    it('should define an agent with required properties', () => {
      const agent: Agent = {
        id: 'agent-1',
        name: 'Test Agent',
        role: AgentRole.GENERAL,
        personality: 'balanced',
        systemPrompt: 'You are a helpful assistant',
        isActive: true,
        createdAt: new Date(),
        lastActiveAt: new Date()
      };

      expect(agent.id).toBe('agent-1');
      expect(agent.name).toBe('Test Agent');
      expect(agent.role).toBe(AgentRole.GENERAL);
      expect(agent.personality).toBe('balanced');
      expect(agent.systemPrompt).toBe('You are a helpful assistant');
      expect(agent.isActive).toBe(true);
      expect(agent.createdAt).toBeInstanceOf(Date);
      expect(agent.lastActiveAt).toBeInstanceOf(Date);
    });
  });

  describe('AgentMessage interface', () => {
    it('should extend Message with agent metadata', () => {
      const agentMessage: AgentMessage = {
        role: 'user',
        content: 'Hello agent!',
        agentId: 'agent-1',
        timestamp: new Date(),
        id: 'msg-1'
      };

      expect(agentMessage.role).toBe('user');
      expect(agentMessage.content).toBe('Hello agent!');
      expect(agentMessage.agentId).toBe('agent-1');
      expect(agentMessage.timestamp).toBeInstanceOf(Date);
      expect(agentMessage.id).toBe('msg-1');
    });
  });

  describe('AgentRole enum', () => {
    it('should define agent roles', () => {
      expect(AgentRole.GENERAL).toBeDefined();
      expect(AgentRole.SPECIALIST).toBeDefined();
      expect(AgentRole.COORDINATOR).toBeDefined();
    });
  });
});
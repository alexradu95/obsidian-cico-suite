import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS, DailyAIAssistantSettings, AgentMode } from './index';
import { Agent, AgentRole } from './agent';

describe('Extended Settings Types', () => {
  describe('DailyAIAssistantSettings with multi-agent support', () => {
    it('should include agent mode and agents array', () => {
      const settings: DailyAIAssistantSettings = {
        ...DEFAULT_SETTINGS,
        agentMode: AgentMode.MULTI,
        agents: [
          {
            id: 'agent-1',
            name: 'General Assistant',
            role: AgentRole.GENERAL,
            personality: 'balanced',
            systemPrompt: 'You are a helpful general assistant',
            isActive: true,
            createdAt: new Date(),
            lastActiveAt: new Date()
          }
        ],
        activeAgentId: 'agent-1'
      };

      expect(settings.agentMode).toBe(AgentMode.MULTI);
      expect(settings.agents).toHaveLength(1);
      expect(settings.agents![0].id).toBe('agent-1');
      expect(settings.activeAgentId).toBe('agent-1');
    });
  });

  describe('AgentMode enum', () => {
    it('should define single and multi agent modes', () => {
      expect(AgentMode.SINGLE).toBe('single');
      expect(AgentMode.MULTI).toBe('multi');
    });
  });

  describe('DEFAULT_SETTINGS with agent support', () => {
    it('should default to single agent mode', () => {
      expect(DEFAULT_SETTINGS.agentMode).toBe(AgentMode.SINGLE);
      expect(DEFAULT_SETTINGS.agents).toBeUndefined();
      expect(DEFAULT_SETTINGS.activeAgentId).toBeUndefined();
    });
  });
});
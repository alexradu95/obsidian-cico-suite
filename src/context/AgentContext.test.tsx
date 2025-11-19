import { describe, it, expect, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { AgentContext, AgentContextType, useAgents } from './AgentContext';
import { Agent, AgentRole } from '../types/agent';
import { AgentService } from '../services/AgentService';
import { ReactNode } from 'react';

// Mock AgentService
const mockAgentService = {
  registerAgent: () => {},
  unregisterAgent: () => {},
  getAgents: () => [],
  getAgent: () => undefined,
  processMessage: async () => 'Mock response'
} as unknown as AgentService;

describe('AgentContext', () => {
  let testAgent: Agent;
  let contextValue: AgentContextType;

  beforeEach(() => {
    testAgent = {
      id: 'agent-1',
      name: 'Test Agent',
      role: AgentRole.GENERAL,
      personality: 'balanced',
      systemPrompt: 'You are helpful',
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    };

    contextValue = {
      agentService: mockAgentService,
      activeAgentId: null,
      setActiveAgentId: () => {},
      agents: [],
      setAgents: () => {}
    };
  });

  describe('AgentContext Provider', () => {
    it('should provide agent context value to children', () => {
      const TestComponent = () => {
        const context = useAgents();
        return <div data-testid="context-value">{context.activeAgentId || 'no-agent'}</div>;
      };

      const { getByTestId } = render(
        <AgentContext.Provider value={contextValue}>
          <TestComponent />
        </AgentContext.Provider>
      );

      expect(getByTestId('context-value')).toHaveTextContent('no-agent');
    });
  });

  describe('useAgents hook', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AgentContext.Provider value={contextValue}>{children}</AgentContext.Provider>
    );

    it('should return agent context value', () => {
      const { result } = renderHook(() => useAgents(), { wrapper });

      expect(result.current.agentService).toBeDefined();
      expect(result.current.activeAgentId).toBe(null);
      expect(result.current.agents).toEqual([]);
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useAgents());
      }).toThrow('useAgents must be used within AgentContext.Provider');
    });
  });

  describe('AgentContextType interface', () => {
    it('should define required properties', () => {
      expect(contextValue.agentService).toBeDefined();
      expect(contextValue.activeAgentId).toBeDefined();
      expect(contextValue.setActiveAgentId).toBeDefined();
      expect(contextValue.agents).toBeDefined();
      expect(contextValue.setAgents).toBeDefined();
    });
  });
});
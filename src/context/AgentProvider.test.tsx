import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { AgentProvider } from './AgentProvider';
import { useAgents } from './AgentContext';
import { AgentService } from '../services/AgentService';
import { AIService } from '../services/AIService';
import { Agent, AgentRole } from '../types/agent';
import * as React from 'react';

describe('AgentProvider', () => {
  let mockAIService: AIService;
  let agentService: AgentService;

  beforeEach(() => {
    mockAIService = {
      callLMStudio: vi.fn().mockResolvedValue('Mock response')
    } as unknown as AIService;
    agentService = new AgentService(mockAIService);
  });

  describe('provider functionality', () => {
    it('should provide agent context to children', () => {
      const TestComponent = () => {
        const context = useAgents();
        return <div data-testid="has-context">{context ? 'yes' : 'no'}</div>;
      };

      render(
        <AgentProvider agentService={agentService}>
          <TestComponent />
        </AgentProvider>
      );

      expect(screen.getByTestId('has-context')).toHaveTextContent('yes');
    });

    it('should provide agentService to children', () => {
      const TestComponent = () => {
        const { agentService: providedService } = useAgents();
        return <div data-testid="service-provided">{providedService ? 'yes' : 'no'}</div>;
      };

      render(
        <AgentProvider agentService={agentService}>
          <TestComponent />
        </AgentProvider>
      );

      expect(screen.getByTestId('service-provided')).toHaveTextContent('yes');
    });

    it('should initialize with no active agent', () => {
      const TestComponent = () => {
        const { activeAgentId } = useAgents();
        return <div data-testid="active-agent">{activeAgentId || 'none'}</div>;
      };

      render(
        <AgentProvider agentService={agentService}>
          <TestComponent />
        </AgentProvider>
      );

      expect(screen.getByTestId('active-agent')).toHaveTextContent('none');
    });

    it('should initialize with empty agents array', () => {
      const TestComponent = () => {
        const { agents } = useAgents();
        return <div data-testid="agents-count">{agents.length}</div>;
      };

      render(
        <AgentProvider agentService={agentService}>
          <TestComponent />
        </AgentProvider>
      );

      expect(screen.getByTestId('agents-count')).toHaveTextContent('0');
    });
  });

  describe('initial agents', () => {
    it('should accept and provide initial agents', () => {
      const initialAgents: Agent[] = [
        {
          id: 'agent-1',
          name: 'Test Agent',
          role: AgentRole.GENERAL,
          personality: 'balanced',
          systemPrompt: 'You are helpful',
          isActive: true,
          createdAt: new Date(),
          lastActiveAt: new Date()
        }
      ];

      const TestComponent = () => {
        const { agents } = useAgents();
        return <div data-testid="agents-count">{agents.length}</div>;
      };

      render(
        <AgentProvider agentService={agentService} initialAgents={initialAgents}>
          <TestComponent />
        </AgentProvider>
      );

      expect(screen.getByTestId('agents-count')).toHaveTextContent('1');
    });

    it('should register initial agents with the service', () => {
      const registerSpy = vi.spyOn(agentService, 'registerAgent');

      const initialAgents: Agent[] = [
        {
          id: 'agent-1',
          name: 'Test Agent',
          role: AgentRole.GENERAL,
          personality: 'balanced',
          systemPrompt: 'You are helpful',
          isActive: true,
          createdAt: new Date(),
          lastActiveAt: new Date()
        }
      ];

      render(
        <AgentProvider agentService={agentService} initialAgents={initialAgents}>
          <div>Test</div>
        </AgentProvider>
      );

      expect(registerSpy).toHaveBeenCalledWith(initialAgents[0]);
    });
  });
});
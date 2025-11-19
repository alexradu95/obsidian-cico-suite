import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentSelector } from './AgentSelector';
import { Agent, AgentRole } from '../types/agent';

describe('AgentSelector', () => {
  const mockAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'General Assistant',
      role: AgentRole.GENERAL,
      personality: 'balanced',
      systemPrompt: 'You are helpful',
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    },
    {
      id: 'agent-2',
      name: 'Specialist Assistant',
      role: AgentRole.SPECIALIST,
      personality: 'concise',
      systemPrompt: 'You are a specialist',
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    }
  ];

  describe('rendering', () => {
    it('should render list of agents', () => {
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={mockAgents}
          activeAgentId={null}
          onSelectAgent={onSelectAgent}
        />
      );

      expect(screen.getByText('General Assistant')).toBeInTheDocument();
      expect(screen.getByText('Specialist Assistant')).toBeInTheDocument();
    });

    it('should highlight active agent', () => {
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={mockAgents}
          activeAgentId="agent-1"
          onSelectAgent={onSelectAgent}
        />
      );

      const activeAgentElement = screen.getByText('General Assistant').closest('button');
      expect(activeAgentElement).toHaveClass('active');
    });

    it('should show message when no agents exist', () => {
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={[]}
          activeAgentId={null}
          onSelectAgent={onSelectAgent}
        />
      );

      expect(screen.getByText(/no agents/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSelectAgent when agent is clicked', async () => {
      const user = userEvent.setup();
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={mockAgents}
          activeAgentId={null}
          onSelectAgent={onSelectAgent}
        />
      );

      await user.click(screen.getByText('General Assistant'));

      expect(onSelectAgent).toHaveBeenCalledWith('agent-1');
    });

    it('should not call onSelectAgent when clicking already active agent', async () => {
      const user = userEvent.setup();
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={mockAgents}
          activeAgentId="agent-1"
          onSelectAgent={onSelectAgent}
        />
      );

      await user.click(screen.getByText('General Assistant'));

      expect(onSelectAgent).not.toHaveBeenCalled();
    });
  });

  describe('agent display', () => {
    it('should show agent role badge', () => {
      const onSelectAgent = vi.fn();

      render(
        <AgentSelector
          agents={mockAgents}
          activeAgentId={null}
          onSelectAgent={onSelectAgent}
        />
      );

      expect(screen.getByText('general')).toBeInTheDocument();
      expect(screen.getByText('specialist')).toBeInTheDocument();
    });
  });
});
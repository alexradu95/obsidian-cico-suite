import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiAgentChatView } from './MultiAgentChatView';
import { AgentMessage } from '../types/agent';

describe('MultiAgentChatView', () => {
  const mockMessages: AgentMessage[] = [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello agent 1!',
      agentId: 'agent-1',
      timestamp: new Date('2024-01-01T10:00:00')
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hello! How can I help?',
      agentId: 'agent-1',
      timestamp: new Date('2024-01-01T10:00:05')
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'What is the weather?',
      agentId: 'agent-2',
      timestamp: new Date('2024-01-01T10:01:00')
    }
  ];

  let mockOnSendMessage: (content: string, agentId: string) => void;

  beforeEach(() => {
    mockOnSendMessage = vi.fn() as (content: string, agentId: string) => void;
  });

  describe('rendering', () => {
    it('should render messages from active agent', () => {
      render(
        <MultiAgentChatView
          messages={mockMessages}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      expect(screen.getByText('Hello agent 1!')).toBeInTheDocument();
      expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
      expect(screen.queryByText('What is the weather?')).not.toBeInTheDocument();
    });

    it('should show loading indicator when loading', () => {
      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={true}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show empty state when no messages', () => {
      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      expect(screen.getByText(/no messages/i)).toBeInTheDocument();
    });

    it('should render all messages when no active agent', () => {
      render(
        <MultiAgentChatView
          messages={mockMessages}
          activeAgentId={null}
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      expect(screen.getByText('Hello agent 1!')).toBeInTheDocument();
      expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
      expect(screen.getByText('What is the weather?')).toBeInTheDocument();
    });
  });

  describe('message input', () => {
    it('should allow typing and sending messages', async () => {
      const user = userEvent.setup();

      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i);
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', 'agent-1');
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();

      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(input.value).toBe('');
    });

    it('should disable input when loading', () => {
      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={true}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i);
      expect(input).toBeDisabled();
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();

      render(
        <MultiAgentChatView
          messages={[]}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('message display', () => {
    it('should distinguish user and assistant messages', () => {
      render(
        <MultiAgentChatView
          messages={mockMessages.slice(0, 2)}
          activeAgentId="agent-1"
          onSendMessage={mockOnSendMessage}
          isLoading={false}
        />
      );

      const userMessage = screen.getByText('Hello agent 1!').closest('.message');
      const assistantMessage = screen.getByText('Hello! How can I help?').closest('.message');

      expect(userMessage).toHaveClass('user');
      expect(assistantMessage).toHaveClass('assistant');
    });
  });
});
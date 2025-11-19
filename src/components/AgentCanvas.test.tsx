import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCanvas } from './AgentCanvas';
import { CanvasData, CanvasNodeType } from '../types/canvas';
import { AgentRole } from '../types/agent';

describe('AgentCanvas', () => {
  const emptyCanvas: CanvasData = {
    nodes: [],
    connections: []
  };

  const mockCanvasData: CanvasData = {
    nodes: [
      {
        id: 'node-1',
        type: CanvasNodeType.AGENT,
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        agent: {
          id: 'agent-1',
          name: 'Test Agent',
          role: AgentRole.GENERAL,
          personality: 'balanced',
          systemPrompt: 'Test prompt',
          isActive: true,
          createdAt: new Date(),
          lastActiveAt: new Date()
        }
      },
      {
        id: 'node-2',
        type: CanvasNodeType.NOTE,
        position: { x: 400, y: 100 },
        size: { width: 200, height: 150 },
        notePath: 'path/to/note.md',
        noteTitle: 'Test Note'
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2'
      }
    ]
  };

  describe('rendering', () => {
    it('should render canvas container', () => {
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('agent-canvas')).toBeInTheDocument();
    });

    it('should render agent nodes', () => {
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });

    it('should render note nodes', () => {
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    it('should show empty state when no nodes', () => {
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByText(/start building your network/i)).toBeInTheDocument();
    });
  });

  describe('toolbar', () => {
    it('should render toolbar with add buttons', () => {
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /add agent/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
    });
  });

  describe('node count', () => {
    it('should display correct node count', () => {
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={vi.fn()}
        />
      );

      expect(screen.getByText(/2 nodes/i)).toBeInTheDocument();
    });
  });

  describe('node dragging', () => {
    it('should update node position when dragged', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={onDataChange}
        />
      );

      const node = screen.getByText('Test Agent').closest('.canvas-node');
      expect(node).toBeInTheDocument();

      // Simulate drag start
      fireEvent.mouseDown(node!, { clientX: 100, clientY: 100 });

      // Simulate drag move
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

      // Simulate drag end
      fireEvent.mouseUp(document);

      // Should have called onDataChange with updated position
      expect(onDataChange).toHaveBeenCalled();
      const updatedData = onDataChange.mock.calls[0][0];
      expect(updatedData.nodes[0].position.x).toBe(150);
      expect(updatedData.nodes[0].position.y).toBe(150);
    });

    it('should not update position when not dragging', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={onDataChange}
        />
      );

      // Simulate mouse move without mousedown
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

      // Should not have called onDataChange
      expect(onDataChange).not.toHaveBeenCalled();
    });
  });

  describe('adding nodes', () => {
    it('should add new agent node when Add Agent button is clicked', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={onDataChange}
        />
      );

      const addAgentButton = screen.getByRole('button', { name: /add agent/i });
      fireEvent.click(addAgentButton);

      // Should have called onDataChange with new agent node
      expect(onDataChange).toHaveBeenCalled();
      const updatedData = onDataChange.mock.calls[0][0];

      expect(updatedData.nodes).toHaveLength(1);
      expect(updatedData.nodes[0].type).toBe(CanvasNodeType.AGENT);
      expect(updatedData.nodes[0].id).toBeDefined();
      expect(updatedData.nodes[0].agent).toBeDefined();
      expect(updatedData.nodes[0].agent.name).toBeDefined();
    });

    it('should add agent node at center position', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={onDataChange}
        />
      );

      const addAgentButton = screen.getByRole('button', { name: /add agent/i });
      fireEvent.click(addAgentButton);

      const updatedData = onDataChange.mock.calls[0][0];
      expect(updatedData.nodes[0].position.x).toBeGreaterThan(0);
      expect(updatedData.nodes[0].position.y).toBeGreaterThan(0);
    });

    it('should add multiple agents when button clicked multiple times', () => {
      const onDataChange = vi.fn();
      const { rerender } = render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={onDataChange}
        />
      );

      const addAgentButton = screen.getByRole('button', { name: /add agent/i });

      // First click
      fireEvent.click(addAgentButton);
      const firstData = onDataChange.mock.calls[0][0];

      // Re-render with updated data
      rerender(
        <AgentCanvas
          data={firstData}
          onDataChange={onDataChange}
        />
      );

      // Second click
      fireEvent.click(addAgentButton);
      const secondData = onDataChange.mock.calls[1][0];

      expect(secondData.nodes).toHaveLength(2);
      expect(secondData.nodes[0].id).not.toBe(secondData.nodes[1].id);
    });

    it('should add new note node when Add Note button is clicked', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={onDataChange}
        />
      );

      const addNoteButton = screen.getByRole('button', { name: /add note/i });
      fireEvent.click(addNoteButton);

      // Should have called onDataChange with new note node
      expect(onDataChange).toHaveBeenCalled();
      const updatedData = onDataChange.mock.calls[0][0];

      expect(updatedData.nodes).toHaveLength(1);
      expect(updatedData.nodes[0].type).toBe(CanvasNodeType.NOTE);
      expect(updatedData.nodes[0].id).toBeDefined();
      expect(updatedData.nodes[0].notePath).toBeDefined();
      expect(updatedData.nodes[0].noteTitle).toBeDefined();
    });

    it('should add note node at default position', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={emptyCanvas}
          onDataChange={onDataChange}
        />
      );

      const addNoteButton = screen.getByRole('button', { name: /add note/i });
      fireEvent.click(addNoteButton);

      const updatedData = onDataChange.mock.calls[0][0];
      expect(updatedData.nodes[0].position.x).toBeGreaterThan(0);
      expect(updatedData.nodes[0].position.y).toBeGreaterThan(0);
    });
  });

  describe('creating connections', () => {
    it('should create connection between two nodes when both are clicked in connect mode', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={onDataChange}
        />
      );

      // Enter connection mode
      const connectButton = screen.getByRole('button', { name: /connect/i });
      fireEvent.click(connectButton);

      // Click source node
      const sourceNode = screen.getByText('Test Agent').closest('.canvas-node');
      fireEvent.click(sourceNode!);

      // Click target node
      const targetNode = screen.getByText('Test Note').closest('.canvas-node');
      fireEvent.click(targetNode!);

      // Should have called onDataChange with new connection
      expect(onDataChange).toHaveBeenCalled();
      const updatedData = onDataChange.mock.calls[onDataChange.mock.calls.length - 1][0];

      expect(updatedData.connections.length).toBeGreaterThan(mockCanvasData.connections.length);
      const newConnection = updatedData.connections[updatedData.connections.length - 1];
      expect(newConnection.sourceNodeId).toBe('node-1');
      expect(newConnection.targetNodeId).toBe('node-2');
    });

    it('should not create connection when not in connect mode', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={onDataChange}
        />
      );

      // Click nodes without entering connect mode
      const sourceNode = screen.getByText('Test Agent').closest('.canvas-node');
      fireEvent.click(sourceNode!);

      const targetNode = screen.getByText('Test Note').closest('.canvas-node');
      fireEvent.click(targetNode!);

      // Should not have created connection
      expect(onDataChange).not.toHaveBeenCalled();
    });

    it('should exit connect mode after creating connection', () => {
      const onDataChange = vi.fn();
      render(
        <AgentCanvas
          data={mockCanvasData}
          onDataChange={onDataChange}
        />
      );

      const connectButton = screen.getByRole('button', { name: /connect/i });

      // Enter connect mode
      fireEvent.click(connectButton);

      // Create connection
      const sourceNode = screen.getByText('Test Agent').closest('.canvas-node');
      fireEvent.click(sourceNode!);

      const targetNode = screen.getByText('Test Note').closest('.canvas-node');
      fireEvent.click(targetNode!);

      // Try to create another connection without re-entering connect mode
      onDataChange.mockClear();

      fireEvent.click(sourceNode!);
      fireEvent.click(targetNode!);

      // Should not create another connection
      expect(onDataChange).not.toHaveBeenCalled();
    });
  });
});
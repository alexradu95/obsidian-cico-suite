# React Flow Implementation Guide for Obsidian Plugin

## Executive Summary

React Flow is a highly customizable React library for building node-based editors and interactive diagrams. This document provides a comprehensive technical overview for implementing React Flow in the Daily AI Assistant Obsidian plugin to create a visual AI workflow canvas.

**Key Statistics:**
- 33.8K GitHub stars
- 2.79M weekly npm downloads
- Used by Stripe, Zapier, and Retool
- MIT licensed
- Full TypeScript support
- Active community and documentation

---

## 1. React Flow Basics

### 1.1 Core Concepts

#### Nodes
- React components representing individual elements on the canvas
- Fully customizable using standard React patterns
- Support for different node types (default, input, output, group, custom)
- Built-in dragging, selection, and deletion
- Automatic dimension calculation

#### Edges
- Connections between nodes
- Support for different edge types:
  - `default` (bezier curve)
  - `straight`
  - `step`
  - `smoothstep`
  - `simplebezier`
- Customizable styling, markers, and labels
- Support for reconnection and validation

#### Handles
- Connection points within custom nodes
- Define where edges can attach to nodes
- Support for validation of connections
- Can be positioned at any location within a node
- Support for multiple handles per node

#### Viewport
- Controls panning and zooming interactions
- Customizable viewport behavior through hooks
- Programmatic viewport control via `useReactFlow()` hook
- Support for viewport constraints and boundaries

### 1.2 Installation and Setup

#### Package Installation

```bash
npm install @xyflow/react
```

#### Basic Project Setup

```typescript
// Required CSS import (must be included)
import '@xyflow/react/dist/style.css';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';

// Basic component structure
function FlowComponent() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

**Critical Requirements:**
1. The CSS stylesheet MUST be imported for React Flow to work
2. The parent container MUST have defined width and height
3. Container cannot use `display: flex` without explicit dimensions

### 1.3 TypeScript Support

React Flow provides comprehensive TypeScript type definitions:

```typescript
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowInstance,
} from '@xyflow/react';

// Custom node data typing
type CustomNodeData = {
  label: string;
  description: string;
  status: 'active' | 'inactive';
};

// Typed nodes
const nodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1', description: 'Description', status: 'active' },
  },
];

// Use generic types with hooks
const reactFlowInstance = useReactFlow<CustomNodeData>();
```

### 1.4 Performance Characteristics

React Flow is optimized for performance:

- **Rendering:** Uses React reconciliation and virtual DOM
- **Large Graphs:** Supports thousands of nodes with proper optimization
- **Memoization:** Critical for preventing unnecessary re-renders
- **Viewport Culling:** Only renders visible nodes (with pro features)
- **Event Handling:** Efficient event delegation system

---

## 2. Integration with Obsidian

### 2.1 Embedding in ItemView

React Flow can be integrated into an Obsidian ItemView using React:

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { FlowCanvas } from './components/FlowCanvas';

export const VIEW_TYPE_FLOW = 'flow-canvas-view';

export class FlowCanvasView extends ItemView {
  private root: Root | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_FLOW;
  }

  getDisplayText(): string {
    return 'AI Flow Canvas';
  }

  getIcon(): string {
    return 'git-fork';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();

    // Create a wrapper div with proper dimensions
    const wrapper = container.createDiv({
      cls: 'flow-canvas-wrapper',
    });

    // Set wrapper to fill available space
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.position = 'relative';

    // Create React root and render
    this.root = createRoot(wrapper);
    this.root.render(
      <StrictMode>
        <FlowCanvas />
      </StrictMode>
    );
  }

  async onClose(): Promise<void> {
    // Cleanup React root
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
```

**Key Considerations:**
1. Use React 19's `createRoot` API (already in your dependencies)
2. Ensure the container has proper dimensions
3. Clean up the React root in `onClose()`
4. Consider wrapping in React.StrictMode for development

### 2.2 State Management

For complex flows, consider using a state management solution:

#### Option 1: React Context (Simple)

```typescript
import { createContext, useContext, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';

type FlowContextType = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
};

const FlowContext = createContext<FlowContextType | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  return (
    <FlowContext.Provider value={{ nodes, edges, setNodes, setEdges }}>
      {children}
    </FlowContext.Provider>
  );
}

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) throw new Error('useFlow must be used within FlowProvider');
  return context;
};
```

#### Option 2: Zustand (Recommended for Complex State)

```typescript
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

type FlowStore = {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodes: (ids: string[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
};

export const useFlowStore = create<FlowStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodes: (ids) => set({ selectedNodes: ids }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),
}));
```

**Performance Note:** Keep selected nodes in separate state to avoid re-renders when selection changes but nodes don't.

### 2.3 File Watching and Auto-Reload

Integrate with Obsidian's file system:

```typescript
import { TFile, Vault } from 'obsidian';

export class FlowFileWatcher {
  private vault: Vault;
  private currentFile: TFile | null = null;
  private onReload: (data: FlowData) => void;

  constructor(vault: Vault, onReload: (data: FlowData) => void) {
    this.vault = vault;
    this.onReload = onReload;
  }

  async loadFile(file: TFile): Promise<void> {
    this.currentFile = file;
    const content = await this.vault.read(file);
    const data = JSON.parse(content);
    this.onReload(data);
  }

  async saveFile(data: FlowData): Promise<void> {
    if (!this.currentFile) return;
    const content = JSON.stringify(data, null, 2);
    await this.vault.modify(this.currentFile, content);
  }

  // Watch for external changes
  watchFile(file: TFile): void {
    this.vault.on('modify', (modifiedFile) => {
      if (modifiedFile.path === file.path) {
        this.loadFile(file);
      }
    });
  }
}
```

### 2.4 Theme Integration

React Flow supports custom theming through CSS variables:

```css
/* styles.css */
.flow-canvas-wrapper {
  /* Light mode colors */
  --background-color: var(--background-primary);
  --node-color: var(--background-secondary);
  --text-color: var(--text-normal);
  --border-color: var(--background-modifier-border);
}

.theme-dark .flow-canvas-wrapper {
  /* Dark mode colors */
  --background-color: var(--background-primary);
  --node-color: var(--background-secondary);
  --text-color: var(--text-normal);
  --border-color: var(--background-modifier-border);
}

/* Override React Flow's default colors */
.react-flow__node {
  background-color: var(--node-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.react-flow__edge-path {
  stroke: var(--text-muted);
}

.react-flow__handle {
  background-color: var(--interactive-accent);
  border: 1px solid var(--border-color);
}
```

**Dynamic Theme Switching:**

```typescript
import { useEffect, useState } from 'react';

export function useObsidianTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.body.classList.contains('theme-dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Initial theme
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

// Usage in component
function FlowCanvas() {
  const theme = useObsidianTheme();

  return (
    <div className={`flow-canvas-wrapper theme-${theme}`}>
      <ReactFlow {...props} />
    </div>
  );
}
```

---

## 3. Custom Nodes

### 3.1 Creating Custom Node Components

Custom nodes are React components that receive specific props:

```typescript
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type CustomNodeData = {
  label: string;
  description: string;
  status: 'active' | 'inactive' | 'processing';
};

// Memoize to prevent unnecessary re-renders
export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />

      <div className="node-header">
        <span className="node-status">{data.status}</span>
        <h3>{data.label}</h3>
      </div>

      <div className="node-body">
        <p>{data.description}</p>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555' }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
```

**Node Props Available:**

```typescript
type NodeProps<T = any> = {
  id: string;                    // Node ID
  type: string;                  // Node type
  data: T;                       // Custom data
  selected: boolean;             // Selection state
  isConnectable: boolean;        // Can connect edges
  zIndex: number;                // Z-index
  xPos: number;                  // X position
  yPos: number;                  // Y position
  dragging: boolean;             // Currently dragging
  targetPosition?: Position;     // Target handle position
  sourcePosition?: Position;     // Source handle position
};
```

### 3.2 Registering Custom Nodes

```typescript
import { ReactFlow } from '@xyflow/react';
import { CustomNode } from './nodes/CustomNode';
import { AIAgentNode } from './nodes/AIAgentNode';
import { ProcessorNode } from './nodes/ProcessorNode';

const nodeTypes = {
  custom: CustomNode,
  aiAgent: AIAgentNode,
  processor: ProcessorNode,
};

function FlowCanvas() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      {...otherProps}
    />
  );
}
```

### 3.3 Styling Approaches

#### Option 1: CSS Modules (Recommended)

```typescript
// CustomNode.module.css
.customNode {
  padding: 16px;
  border-radius: 8px;
  background: var(--node-color);
  border: 2px solid var(--border-color);
  min-width: 200px;
  transition: border-color 0.2s;
}

.customNode.selected {
  border-color: var(--interactive-accent);
  box-shadow: 0 0 0 2px var(--interactive-accent-hover);
}

.nodeHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.nodeBody {
  font-size: 14px;
  color: var(--text-muted);
}
```

```typescript
import styles from './CustomNode.module.css';

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  return (
    <div className={`${styles.customNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className={styles.nodeHeader}>
        <h3>{data.label}</h3>
      </div>
      <div className={styles.nodeBody}>
        <p>{data.description}</p>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
```

#### Option 2: Inline Styles (For Dynamic Styling)

```typescript
export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const nodeStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 8,
    background: data.backgroundColor || 'var(--node-color)',
    border: `2px solid ${selected ? 'var(--interactive-accent)' : 'var(--border-color)'}`,
    minWidth: 200,
    transition: 'border-color 0.2s',
  };

  return (
    <div style={nodeStyle}>
      {/* Node content */}
    </div>
  );
});
```

#### Option 3: Styled Components (If using styled-components)

```typescript
import styled from 'styled-components';

const StyledNode = styled.div<{ selected: boolean }>`
  padding: 16px;
  border-radius: 8px;
  background: var(--node-color);
  border: 2px solid ${props => props.selected ? 'var(--interactive-accent)' : 'var(--border-color)'};
  min-width: 200px;
  transition: border-color 0.2s;

  ${props => props.selected && `
    box-shadow: 0 0 0 2px var(--interactive-accent-hover);
  `}
`;

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  return (
    <StyledNode selected={selected}>
      {/* Node content */}
    </StyledNode>
  );
});
```

### 3.4 Node Resizing

React Flow provides `NodeResizer` component for resizable nodes:

```typescript
import { memo } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';

export const ResizableNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        color="var(--interactive-accent)"
      />
      <div className="resizable-node">
        <Handle type="target" position={Position.Left} />
        <div>{data.label}</div>
        <Handle type="source" position={Position.Right} />
      </div>
    </>
  );
});
```

**Custom Resize Controls:**

```typescript
import { NodeResizeControl } from '@xyflow/react';

export const CustomResizableNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizeControl
        style={{ background: 'transparent', border: 'none' }}
        minWidth={100}
        minHeight={50}
      >
        <div style={{ position: 'absolute', right: 5, bottom: 5 }}>
          <svg width="16" height="16">
            {/* Custom resize icon */}
            <path d="M14,14 L14,10 M14,14 L10,14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </NodeResizeControl>
      <div className="custom-resizable-node">
        {data.label}
      </div>
    </>
  );
});
```

### 3.5 Multiple Handles and Connection Points

```typescript
import { Handle, Position, type NodeProps } from '@xyflow/react';

type MultiHandleNodeData = {
  label: string;
  inputs: string[];
  outputs: string[];
};

export const MultiHandleNode = memo(({ data }: NodeProps<MultiHandleNodeData>) => {
  return (
    <div className="multi-handle-node">
      {/* Multiple input handles on the left */}
      <div className="handles-left">
        {data.inputs.map((input, index) => (
          <div key={`input-${index}`} className="handle-wrapper">
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              style={{ top: `${(index + 1) * (100 / (data.inputs.length + 1))}%` }}
            />
            <span className="handle-label">{input}</span>
          </div>
        ))}
      </div>

      <div className="node-content">
        <h3>{data.label}</h3>
      </div>

      {/* Multiple output handles on the right */}
      <div className="handles-right">
        {data.outputs.map((output, index) => (
          <div key={`output-${index}`} className="handle-wrapper">
            <span className="handle-label">{output}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${index}`}
              style={{ top: `${(index + 1) * (100 / (data.outputs.length + 1))}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
```

### 3.6 Interactive Node Content

Nodes can contain interactive elements:

```typescript
import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type InteractiveNodeData = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

export const InteractiveNode = memo(({ data, id }: NodeProps<InteractiveNodeData>) => {
  const [localValue, setLocalValue] = useState(data.value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    data.onValueChange(newValue);
  }, [data]);

  return (
    <div className="interactive-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <h3>{data.label}</h3>
      </div>

      <textarea
        className="node-input"
        value={localValue}
        onChange={handleChange}
        placeholder="Enter text..."
        rows={4}
      />

      <Handle type="source" position={Position.Right} />
    </div>
  );
});
```

---

## 4. Data Persistence

### 4.1 React Flow State Structure

React Flow stores its state in a specific format:

```typescript
import type { Node, Edge, Viewport } from '@xyflow/react';

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
};

// Example state
const flowState: FlowState = {
  nodes: [
    {
      id: 'node-1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1', description: 'First node' },
      width: 200,
      height: 100,
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};
```

### 4.2 Saving and Restoring Flow

```typescript
import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export function useSaveRestore() {
  const reactFlowInstance = useReactFlow();

  const saveFlow = useCallback(() => {
    if (!reactFlowInstance) return null;

    const flow = reactFlowInstance.toObject();
    return flow;
  }, [reactFlowInstance]);

  const restoreFlow = useCallback((flow: ReturnType<typeof reactFlowInstance.toObject>) => {
    if (!flow) return;

    const { nodes, edges, viewport } = flow;

    // Restore nodes and edges
    reactFlowInstance.setNodes(nodes || []);
    reactFlowInstance.setEdges(edges || []);

    // Restore viewport
    if (viewport) {
      reactFlowInstance.setViewport(viewport);
    }
  }, [reactFlowInstance]);

  return { saveFlow, restoreFlow };
}

// Usage in component
function FlowCanvas({ file }: { file: TFile }) {
  const { saveFlow, restoreFlow } = useSaveRestore();
  const { app } = useApp();

  const handleSave = useCallback(async () => {
    const flow = saveFlow();
    if (!flow) return;

    const content = JSON.stringify(flow, null, 2);
    await app.vault.modify(file, content);
  }, [saveFlow, file, app]);

  const handleLoad = useCallback(async () => {
    const content = await app.vault.read(file);
    const flow = JSON.parse(content);
    restoreFlow(flow);
  }, [restoreFlow, file, app]);

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleLoad}>Load</button>
      <ReactFlow {...props} />
    </div>
  );
}
```

### 4.3 Converting Between React Flow and JSON Canvas

You already have JSON Canvas types defined. Here's a converter:

```typescript
import type { Node, Edge } from '@xyflow/react';
import type { JSONCanvasData, JSONCanvasNode, JSONCanvasEdge } from '../types/jsoncanvas';

export class FlowCanvasConverter {
  /**
   * Convert React Flow format to JSON Canvas format
   */
  static toJSONCanvas(nodes: Node[], edges: Edge[]): JSONCanvasData {
    const canvasNodes: JSONCanvasNode[] = nodes.map(node => {
      const baseNode = {
        id: node.id,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
        width: Math.round(node.width || 200),
        height: Math.round(node.height || 100),
        color: node.data.color as string | undefined,
      };

      // Determine node type and add type-specific properties
      if (node.type === 'aiAgent' || node.type === 'processor') {
        return {
          ...baseNode,
          type: 'text',
          text: node.data.label || '',
        } as JSONCanvasNode;
      } else if (node.type === 'file') {
        return {
          ...baseNode,
          type: 'file',
          file: node.data.file,
          subpath: node.data.subpath,
        } as JSONCanvasNode;
      } else if (node.type === 'link') {
        return {
          ...baseNode,
          type: 'link',
          url: node.data.url,
        } as JSONCanvasNode;
      } else if (node.type === 'group') {
        return {
          ...baseNode,
          type: 'group',
          label: node.data.label,
          background: node.data.background,
          backgroundStyle: node.data.backgroundStyle,
        } as JSONCanvasNode;
      } else {
        // Default to text node
        return {
          ...baseNode,
          type: 'text',
          text: node.data.text || node.data.label || '',
        } as JSONCanvasNode;
      }
    });

    const canvasEdges: JSONCanvasEdge[] = edges.map(edge => ({
      id: edge.id,
      fromNode: edge.source,
      fromSide: this.positionToSide(edge.sourceHandle),
      fromEnd: edge.markerStart ? 'arrow' : 'none',
      toNode: edge.target,
      toSide: this.positionToSide(edge.targetHandle),
      toEnd: edge.markerEnd ? 'arrow' : 'none',
      color: edge.style?.stroke as string | undefined,
      label: edge.label as string | undefined,
    }));

    return {
      nodes: canvasNodes,
      edges: canvasEdges,
    };
  }

  /**
   * Convert JSON Canvas format to React Flow format
   */
  static fromJSONCanvas(canvasData: JSONCanvasData): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = (canvasData.nodes || []).map(canvasNode => {
      const baseNode = {
        id: canvasNode.id,
        position: { x: canvasNode.x, y: canvasNode.y },
        data: {},
        width: canvasNode.width,
        height: canvasNode.height,
        style: canvasNode.color ? { borderColor: canvasNode.color } : undefined,
      };

      // Convert node type
      switch (canvasNode.type) {
        case 'text':
          return {
            ...baseNode,
            type: 'text',
            data: {
              text: canvasNode.text,
              label: canvasNode.text,
              color: canvasNode.color,
            },
          };

        case 'file':
          return {
            ...baseNode,
            type: 'file',
            data: {
              file: canvasNode.file,
              subpath: canvasNode.subpath,
              color: canvasNode.color,
            },
          };

        case 'link':
          return {
            ...baseNode,
            type: 'link',
            data: {
              url: canvasNode.url,
              color: canvasNode.color,
            },
          };

        case 'group':
          return {
            ...baseNode,
            type: 'group',
            data: {
              label: canvasNode.label,
              background: canvasNode.background,
              backgroundStyle: canvasNode.backgroundStyle,
              color: canvasNode.color,
            },
          };

        default:
          return {
            ...baseNode,
            type: 'default',
            data: {},
          };
      }
    });

    const edges: Edge[] = (canvasData.edges || []).map(canvasEdge => ({
      id: canvasEdge.id,
      source: canvasEdge.fromNode,
      sourceHandle: canvasEdge.fromSide,
      target: canvasEdge.toNode,
      targetHandle: canvasEdge.toSide,
      markerStart: canvasEdge.fromEnd === 'arrow' ? { type: 'arrow' } : undefined,
      markerEnd: canvasEdge.toEnd === 'arrow' ? { type: 'arrowclosed' } : undefined,
      label: canvasEdge.label,
      style: canvasEdge.color ? { stroke: canvasEdge.color } : undefined,
    }));

    return { nodes, edges };
  }

  private static positionToSide(handle: string | null | undefined): 'top' | 'right' | 'bottom' | 'left' | undefined {
    if (!handle) return undefined;
    if (handle.includes('top')) return 'top';
    if (handle.includes('right')) return 'right';
    if (handle.includes('bottom')) return 'bottom';
    if (handle.includes('left')) return 'left';
    return undefined;
  }
}
```

### 4.4 Real-Time Updates and Auto-Save

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import type { TFile } from 'obsidian';

export function useAutoSave(file: TFile, debounceMs = 1000) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const save = useCallback(async () => {
    const canvasData = FlowCanvasConverter.toJSONCanvas(nodes, edges);
    const content = JSON.stringify(canvasData, null, 2);
    await app.vault.modify(file, content);
  }, [file, nodes, edges]);

  // Debounced save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, save, debounceMs]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
  };
}
```

---

## 5. Key Features Implementation

### 5.1 Programmatic Node/Edge Creation

```typescript
import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';

export function useFlowOperations() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const addNode = useCallback((type: string, position: { x: number; y: number }, data: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position,
      data,
    };

    setNodes((nodes) => [...nodes, newNode]);
    return newNode.id;
  }, [setNodes]);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  }, [setNodes]);

  const addEdge = useCallback((sourceId: string, targetId: string, label?: string) => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label,
      markerEnd: { type: 'arrowclosed' },
    };

    setEdges((edges) => [...edges, newEdge]);
    return newEdge.id;
  }, [setEdges]);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    const nodes = getNodes();
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);

    if (!nodeToDuplicate) return null;

    const newNode: Node = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    setNodes((nodes) => [...nodes, newNode]);
    return newNode.id;
  }, [getNodes, setNodes]);

  return {
    addNode,
    removeNode,
    updateNode,
    addEdge,
    removeEdge,
    duplicateNode,
  };
}
```

### 5.2 Selection and Multi-Select

```typescript
import { useCallback } from 'react';
import { useNodesState, useOnSelectionChange } from '@xyflow/react';

export function useSelection() {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodeIds(nodes.map((node) => node.id));
      setSelectedEdgeIds(edges.map((edge) => edge.id));
    },
  });

  const selectNode = useCallback((nodeId: string) => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      }))
    );
  }, []);

  const selectMultipleNodes = useCallback((nodeIds: string[]) => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: nodeIds.includes(node.id),
      }))
    );
  }, []);

  const clearSelection = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({ ...node, selected: false }))
    );
    setEdges((edges) =>
      edges.map((edge) => ({ ...edge, selected: false }))
    );
  }, []);

  return {
    selectedNodeIds,
    selectedEdgeIds,
    selectNode,
    selectMultipleNodes,
    clearSelection,
  };
}
```

### 5.3 Zoom and Pan Controls

```typescript
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';

export function useViewportControls() {
  const { setViewport, getViewport, fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const centerView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

  const focusNode = useCallback((nodeId: string) => {
    fitView({
      nodes: [{ id: nodeId }],
      padding: 0.2,
      duration: 300,
    });
  }, [fitView]);

  const fitAllNodes = useCallback(() => {
    fitView({ padding: 0.1, duration: 300 });
  }, [fitView]);

  const zoomInCustom = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const zoomOutCustom = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const resetZoom = useCallback(() => {
    zoomTo(1, { duration: 300 });
  }, [zoomTo]);

  return {
    centerView,
    focusNode,
    fitAllNodes,
    zoomIn: zoomInCustom,
    zoomOut: zoomOutCustom,
    resetZoom,
    setViewport,
    getViewport,
  };
}
```

### 5.4 MiniMap

```typescript
import { MiniMap } from '@xyflow/react';

function FlowCanvas() {
  return (
    <ReactFlow {...props}>
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case 'aiAgent':
              return '#4CAF50';
            case 'processor':
              return '#2196F3';
            case 'output':
              return '#FF9800';
            default:
              return '#ccc';
          }
        }}
        nodeStrokeWidth={3}
        zoomable
        pannable
        style={{
          background: 'var(--background-secondary)',
          border: '1px solid var(--background-modifier-border)',
        }}
      />
    </ReactFlow>
  );
}
```

### 5.5 Background Patterns

```typescript
import { Background, BackgroundVariant } from '@xyflow/react';

function FlowCanvas() {
  return (
    <ReactFlow {...props}>
      <Background
        variant={BackgroundVariant.Dots}
        gap={12}
        size={1}
        color="var(--text-faint)"
      />
    </ReactFlow>
  );
}

// Available variants:
// - BackgroundVariant.Lines
// - BackgroundVariant.Dots
// - BackgroundVariant.Cross
```

### 5.6 Edge Types and Styling

```typescript
import {
  type Edge,
  type EdgeTypes,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react';

// Custom edge component
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'var(--background-secondary)',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

function FlowCanvas() {
  return (
    <ReactFlow
      {...props}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={{
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--text-muted)', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' },
      }}
    />
  );
}
```

### 5.7 Node Grouping

```typescript
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export const GroupNode = memo(({ data }: NodeProps) => {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 8,
        border: '2px dashed var(--background-modifier-border)',
        background: 'var(--background-secondary-alt)',
        minWidth: 300,
        minHeight: 200,
      }}
    >
      <div style={{ marginBottom: 10, fontWeight: 600 }}>
        {data.label}
      </div>
      {/* Child nodes will be positioned inside this group */}
    </div>
  );
});

// Usage: Set parentId on child nodes
const nodes: Node[] = [
  {
    id: 'group-1',
    type: 'group',
    position: { x: 0, y: 0 },
    data: { label: 'Processing Group' },
    style: { width: 400, height: 300 },
  },
  {
    id: 'child-1',
    type: 'default',
    position: { x: 50, y: 50 }, // Relative to parent
    data: { label: 'Child Node' },
    parentId: 'group-1', // This makes it a child of group-1
  },
];
```

---

## 6. Best Practices

### 6.1 Performance Optimization

#### Memoization is Critical

```typescript
import { memo, useCallback, useMemo } from 'react';

// ALWAYS memoize node components
export const CustomNode = memo(({ data, selected }: NodeProps) => {
  // Component implementation
});

// ALWAYS memoize callbacks passed to ReactFlow
function FlowCanvas() {
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Handle changes
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Handle changes
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    // Handle connection
  }, []);

  // Memoize edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#ccc' },
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      defaultEdgeOptions={defaultEdgeOptions}
    />
  );
}
```

#### Separate Selected Nodes State

```typescript
// DON'T: This causes re-renders on every node movement
function BadExample() {
  const nodes = useNodes(); // Re-renders on every change
  const selectedNodes = nodes.filter((n) => n.selected);

  return <div>{selectedNodes.length} selected</div>;
}

// DO: Keep selection in separate state
function GoodExample() {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodeIds(nodes.map((n) => n.id));
    },
  });

  return <div>{selectedNodeIds.length} selected</div>;
}
```

#### Optimize Large Graphs

```typescript
// Use node extent to limit drag area
const nodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: {},
    extent: 'parent', // Constrain to parent bounds
  },
];

// Enable connection radius for better performance
function FlowCanvas() {
  return (
    <ReactFlow
      {...props}
      connectionRadius={50} // Only show drop zones within 50px
      deleteKeyCode={null} // Disable if not needed
      multiSelectionKeyCode={null} // Disable if not needed
    />
  );
}
```

#### Simplify Styling for Large Graphs

```typescript
// Avoid complex CSS for large graphs
.react-flow__node {
  /* Avoid these for large graphs: */
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  /* background: linear-gradient(...); */
  /* filter: blur(1px); */

  /* Use simple styles: */
  background: var(--node-color);
  border: 1px solid var(--border-color);
}
```

### 6.2 Memory Management

```typescript
import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

export function useFlowCleanup() {
  const { setNodes, setEdges } = useReactFlow();
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      // Clear nodes and edges on unmount
      setNodes([]);
      setEdges([]);
    };
  }, [setNodes, setEdges]);
}

// Usage in main component
function FlowCanvas() {
  useFlowCleanup();

  return <ReactFlow {...props} />;
}
```

### 6.3 Event Handling

```typescript
import { useCallback } from 'react';
import type { Node, Edge, Connection } from '@xyflow/react';

export function useFlowEvents() {
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node.id);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node double-clicked:', node.id);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    console.log('Edge clicked:', edge.id);
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    console.log('Connection created:', connection);
    // Validate connection
    if (connection.source === connection.target) {
      return; // Don't allow self-connections
    }
  }, []);

  const onConnectStart = useCallback((event: React.MouseEvent, params: any) => {
    console.log('Connection started from:', params);
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent) => {
    console.log('Connection ended');
  }, []);

  const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Drag started:', node.id);
  }, []);

  const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    // Fires frequently - be careful with expensive operations
  }, []);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Drag stopped:', node.id);
  }, []);

  const onSelectionChange = useCallback((elements: { nodes: Node[]; edges: Edge[] }) => {
    console.log('Selection changed:', elements);
  }, []);

  return {
    onNodeClick,
    onNodeDoubleClick,
    onEdgeClick,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onSelectionChange,
  };
}
```

### 6.4 Accessibility

React Flow has built-in accessibility support, but you can enhance it:

```typescript
import { ReactFlow } from '@xyflow/react';

function FlowCanvas() {
  return (
    <ReactFlow
      {...props}
      // Accessibility props
      nodesFocusable={true}
      edgesFocusable={true}
      elementsSelectable={true}
      // Custom aria labels
      ariaLabel="AI workflow canvas"
    />
  );
}

// Add aria labels to custom nodes
export const CustomNode = memo(({ data }: NodeProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${data.label} node`}
      aria-describedby={`node-desc-${data.id}`}
    >
      <div id={`node-desc-${data.id}`}>
        {data.description}
      </div>
      {/* Node content */}
    </div>
  );
});
```

---

## 7. Example Code

### 7.1 Basic Setup Example

```typescript
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 0, y: 0 },
    data: { label: 'Input Node' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 200, y: 100 },
    data: { label: 'Processing Node' },
  },
  {
    id: '3',
    type: 'output',
    position: { x: 400, y: 0 },
    data: { label: 'Output Node' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export function BasicFlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

### 7.2 Custom Node Example

```typescript
import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type AIAgentNodeData = {
  label: string;
  model: string;
  temperature: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  onExecute?: () => void;
};

export const AIAgentNode = memo(({ data, selected }: NodeProps<AIAgentNodeData>) => {
  const handleExecute = useCallback(() => {
    data.onExecute?.();
  }, [data]);

  const getStatusColor = () => {
    switch (data.status) {
      case 'idle':
        return 'var(--text-muted)';
      case 'processing':
        return '#2196F3';
      case 'complete':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div
      className="ai-agent-node"
      style={{
        padding: 16,
        borderRadius: 8,
        background: 'var(--background-secondary)',
        border: `2px solid ${selected ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'}`,
        minWidth: 250,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'var(--interactive-accent)',
          width: 10,
          height: 10,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: getStatusColor(),
          }}
        />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          {data.label}
        </h3>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
        <div>Model: {data.model}</div>
        <div>Temperature: {data.temperature}</div>
      </div>

      {data.status === 'idle' && (
        <button
          onClick={handleExecute}
          style={{
            width: '100%',
            padding: '6px 12px',
            background: 'var(--interactive-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Execute
        </button>
      )}

      {data.status === 'processing' && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Processing...
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'var(--interactive-accent)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
});

AIAgentNode.displayName = 'AIAgentNode';

// Register the node type
const nodeTypes = {
  aiAgent: AIAgentNode,
};

// Usage in ReactFlow
<ReactFlow nodeTypes={nodeTypes} {...props} />
```

### 7.3 Data Conversion Example

```typescript
import type { Node, Edge } from '@xyflow/react';
import type { JSONCanvasData } from './types/jsoncanvas';
import { TFile } from 'obsidian';

export class FlowPersistence {
  /**
   * Save React Flow data to a .canvas file in JSON Canvas format
   */
  static async saveToFile(
    file: TFile,
    nodes: Node[],
    edges: Edge[],
    vault: Vault
  ): Promise<void> {
    const canvasData = FlowCanvasConverter.toJSONCanvas(nodes, edges);
    const content = JSON.stringify(canvasData, null, 2);
    await vault.modify(file, content);
  }

  /**
   * Load React Flow data from a .canvas file in JSON Canvas format
   */
  static async loadFromFile(
    file: TFile,
    vault: Vault
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const content = await vault.read(file);
    const canvasData: JSONCanvasData = JSON.parse(content);
    return FlowCanvasConverter.fromJSONCanvas(canvasData);
  }

  /**
   * Create a new canvas file with default content
   */
  static async createNewCanvas(
    vault: Vault,
    folderPath: string,
    fileName: string
  ): Promise<TFile> {
    const path = `${folderPath}/${fileName}.canvas`;

    const defaultCanvas: JSONCanvasData = {
      nodes: [
        {
          id: 'welcome-node',
          type: 'text',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          text: '# Welcome to AI Canvas\n\nStart building your workflow!',
        },
      ],
      edges: [],
    };

    const content = JSON.stringify(defaultCanvas, null, 2);
    return await vault.create(path, content);
  }
}

// Usage example
async function example(app: App) {
  const vault = app.vault;
  const file = app.workspace.getActiveFile();

  if (!file || file.extension !== 'canvas') return;

  // Load canvas
  const { nodes, edges } = await FlowPersistence.loadFromFile(file, vault);

  // Modify nodes/edges
  const newNode: Node = {
    id: `node-${Date.now()}`,
    type: 'aiAgent',
    position: { x: 100, y: 100 },
    data: {
      label: 'New AI Agent',
      model: 'gpt-4',
      temperature: 0.7,
      status: 'idle',
    },
  };

  const updatedNodes = [...nodes, newNode];

  // Save canvas
  await FlowPersistence.saveToFile(file, updatedNodes, edges, vault);
}
```

---

## 8. Implementation Roadmap

### Phase 1: Basic Integration
1. Install React Flow package
2. Create basic FlowCanvasView extending ItemView
3. Implement basic node rendering
4. Test JSON Canvas conversion

### Phase 2: Custom Nodes
1. Create AIAgentNode component
2. Create ProcessorNode component
3. Create OutputNode component
4. Add node styling and theming

### Phase 3: Canvas Operations
1. Implement file save/load
2. Add auto-save functionality
3. Implement undo/redo
4. Add context menus

### Phase 4: AI Integration
1. Connect nodes to AI services
2. Implement workflow execution
3. Add progress indicators
4. Handle errors and retries

### Phase 5: Polish
1. Add keyboard shortcuts
2. Improve performance for large canvases
3. Add tutorials/documentation
4. User testing and feedback

---

## 9. Additional Resources

- **React Flow Documentation:** https://reactflow.dev/
- **API Reference:** https://reactflow.dev/api-reference
- **Examples:** https://reactflow.dev/examples
- **JSON Canvas Spec:** https://jsoncanvas.org/
- **Obsidian Plugin API:** https://docs.obsidian.md/Plugins/Getting+started/

---

## 10. Conclusion

React Flow provides a solid foundation for building the AI workflow canvas in your Obsidian plugin. Its TypeScript support, performance characteristics, and extensive API make it well-suited for complex node-based interfaces. The library's compatibility with React 19 (already in your dependencies) and its ability to integrate with Obsidian's ItemView system make it an excellent choice for this project.

Key advantages for your use case:
- Full TypeScript support
- Excellent performance with large graphs
- Easy integration with Obsidian's theme system
- JSON Canvas format compatibility
- Active community and comprehensive documentation

The converter between React Flow format and JSON Canvas format ensures compatibility with Obsidian's native canvas files, allowing users to seamlessly work with both systems.

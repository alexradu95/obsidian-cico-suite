# AI Canvas Workflow - React Flow Implementation Plan

## Executive Summary

This document outlines the comprehensive plan to transition from the current monkey-patching approach to a stable, maintainable React Flow-based canvas implementation while maintaining full JSON Canvas compatibility.

**Timeline:** 4-6 weeks
**Risk Level:** Low (JSON Canvas compatibility maintained)
**Benefits:** Stable API, extensible features, better UX

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Structure](#2-file-structure)
3. [Component Architecture](#3-component-architecture)
4. [Custom Node Types](#4-custom-node-types)
5. [AI Workflow Features](#5-ai-workflow-features)
6. [Implementation Phases](#6-implementation-phases)
7. [Migration Strategy](#7-migration-strategy)
8. [Testing Strategy](#8-testing-strategy)
9. [Success Criteria](#9-success-criteria)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Obsidian Plugin                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │  Main Plugin     │────────▶│  FlowCanvasView        │   │
│  │  (DailyAI...)    │         │  (ItemView)            │   │
│  └──────────────────┘         └────────────────────────┘   │
│                                         │                    │
│                                         ▼                    │
│                          ┌─────────────────────────┐        │
│                          │    React Root           │        │
│                          │    ┌───────────────┐    │        │
│                          │    │  FlowCanvas   │    │        │
│                          │    │  Component    │    │        │
│                          │    └───────────────┘    │        │
│                          └─────────────────────────┘        │
│                                         │                    │
│           ┌──────────────┬──────────────┼─────────┬────────┐
│           ▼              ▼              ▼         ▼        ▼
│      ┌────────┐    ┌──────────┐   ┌────────┐  ┌─────┐  ┌──────┐
│      │ AI     │    │ Processor│   │ Output │  │Hooks│  │ Utils│
│      │ Agent  │    │   Node   │   │  Node  │  │     │  │      │
│      │ Node   │    │          │   │        │  │     │  │      │
│      └────────┘    └──────────┘   └────────┘  └─────┘  └──────┘
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │                    │
                          ▼                    ▼
              ┌──────────────────┐  ┌───────────────────┐
              │  JSON Canvas     │  │   AI Services     │
              │  (File Storage)  │  │  (LM Studio)      │
              └──────────────────┘  └───────────────────┘
```

### Key Design Principles

1. **JSON Canvas Compatibility:** All files remain 100% compatible with Obsidian's native canvas
2. **React Flow as Renderer:** Use React Flow only for visualization and interaction
3. **Bidirectional Sync:** Changes in React Flow immediately reflected in JSON Canvas format
4. **Stateless Components:** All state stored in JSON Canvas, React Flow is just the view
5. **Progressive Enhancement:** Add AI features on top of standard canvas

---

## 2. File Structure

### Proposed Directory Structure

```
src/
├── main.tsx                          # Main plugin entry (existing)
├── types/
│   ├── jsoncanvas.ts                 # JSON Canvas types (existing)
│   ├── obsidian-canvas.d.ts          # Obsidian canvas types (existing)
│   └── flow-nodes.ts                 # React Flow node data types (new)
│
├── views/
│   └── FlowCanvasView.ts             # Obsidian ItemView wrapper (new)
│
├── components/
│   ├── flow/
│   │   ├── FlowCanvas.tsx            # Main React Flow component (new)
│   │   ├── FlowControls.tsx          # Custom controls toolbar (new)
│   │   └── FlowProvider.tsx          # React context for flow state (new)
│   │
│   ├── nodes/
│   │   ├── AIAgentNode.tsx           # Green AI agent node (new)
│   │   ├── ProcessorNode.tsx         # Purple processor node (new)
│   │   ├── OutputNode.tsx            # Yellow output node (new)
│   │   ├── TextNode.tsx              # Standard text node (new)
│   │   ├── FileNode.tsx              # File reference node (new)
│   │   └── GroupNode.tsx             # Grouping node (new)
│   │
│   └── edges/
│       └── CustomEdge.tsx            # Custom edge component (new)
│
├── hooks/
│   ├── useFlowCanvas.ts              # Main flow state management (new)
│   ├── useCanvasFile.ts              # File load/save operations (new)
│   ├── useAutoSave.ts                # Auto-save debouncing (new)
│   ├── useAIWorkflow.ts              # AI processing workflow (new)
│   └── useObsidianTheme.ts           # Theme integration (new)
│
├── services/
│   ├── FlowCanvasConverter.ts        # JSON Canvas ↔ React Flow (new)
│   ├── CanvasService.ts              # Existing service (refactor)
│   ├── AIService.ts                  # Existing service (keep)
│   └── AIProcessingService.ts        # Existing service (integrate)
│
├── utils/
│   ├── node-helpers.ts               # Node creation utilities (new)
│   ├── edge-helpers.ts               # Edge creation utilities (new)
│   └── layout-helpers.ts             # Auto-layout algorithms (new)
│
├── styles/
│   ├── flow-canvas.css               # Main canvas styles (new)
│   ├── nodes.css                     # Node-specific styles (new)
│   └── theme-integration.css         # Obsidian theme CSS vars (new)
│
└── commands/
    └── flow-commands.ts              # Canvas-specific commands (new)
```

### File Size Estimates

| Directory | Files | LOC Estimate |
|-----------|-------|--------------|
| views/ | 1 | ~100 |
| components/flow/ | 3 | ~400 |
| components/nodes/ | 6 | ~800 |
| components/edges/ | 1 | ~100 |
| hooks/ | 5 | ~600 |
| services/ | 4 | ~500 |
| utils/ | 3 | ~300 |
| styles/ | 3 | ~400 |
| commands/ | 1 | ~200 |
| **Total** | **27** | **~3,400 LOC** |

---

## 3. Component Architecture

### Core Components

#### 3.1 FlowCanvasView (Obsidian ItemView)

**Purpose:** Bridge between Obsidian plugin system and React
**Responsibilities:**
- Register as Obsidian view type
- Create React root
- Handle view lifecycle (open/close)
- Pass file reference to React components

```typescript
export class FlowCanvasView extends ItemView {
  private root: Root | null = null;
  private file: TFile | null = null;

  getViewType(): string {
    return 'ai-flow-canvas';
  }

  async onOpen(): Promise<void> {
    // Create React root and render FlowCanvas
  }

  async onClose(): Promise<void> {
    // Cleanup React root
  }

  async setFile(file: TFile): Promise<void> {
    // Load canvas file
  }
}
```

#### 3.2 FlowCanvas (Main React Component)

**Purpose:** Main React Flow integration component
**Responsibilities:**
- Render React Flow
- Manage nodes/edges state
- Handle user interactions
- Coordinate auto-save

```typescript
export function FlowCanvas({ file }: { file: TFile }) {
  const { nodes, edges, onNodesChange, onEdgesChange } = useFlowCanvas(file);
  const { saveFlow } = useAutoSave(file);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
        <Controls />
        <MiniMap />
        <FlowControls />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
```

#### 3.3 FlowControls (Custom Toolbar)

**Purpose:** AI workflow-specific controls
**Features:**
- Add AI agent button
- Add processor button
- Add output button
- Execute workflow button
- Layout buttons (auto-arrange)
- Zoom controls
- Settings panel

```typescript
export function FlowControls() {
  const { addNode, executeWorkflow } = useFlowOperations();

  return (
    <Panel position="top-right">
      <button onClick={() => addNode('aiAgent')}>
        🤖 Add Agent
      </button>
      <button onClick={() => addNode('processor')}>
        ⚙️ Add Processor
      </button>
      <button onClick={() => addNode('output')}>
        📤 Add Output
      </button>
      <Separator />
      <button onClick={executeWorkflow}>
        ▶️ Execute Workflow
      </button>
    </Panel>
  );
}
```

---

## 4. Custom Node Types

### Node Type Specifications

#### 4.1 AI Agent Node (Green)

**Visual Design:**
```
┌─────────────────────────────────┐
│ 🤖 AI Agent                     │
├─────────────────────────────────┤
│ > Default Assistant             │
│                                 │
│ Role: general                   │
│ Model: gpt-4                    │
│ Temperature: 0.7                │
│                                 │
│ System Prompt:                  │
│ ┌─────────────────────────────┐ │
│ │ [Editable text area]        │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Status: ● Idle                  │
└─────────────────────────────────┘
  ⚪ Input          Output ⚪
```

**Features:**
- Editable system prompt
- Model selection dropdown
- Temperature slider
- Status indicator (idle/processing/complete/error)
- Execution button
- Input handle (left)
- Output handle (right)

**Data Structure:**
```typescript
type AIAgentNodeData = {
  label: string;
  role: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  status: 'idle' | 'processing' | 'complete' | 'error';
  lastOutput?: string;
  color: '4'; // Green in JSON Canvas
};
```

#### 4.2 Processor Node (Purple)

**Visual Design:**
```
┌─────────────────────────────────┐
│ ⚙️ AI Processor                  │
├─────────────────────────────────┤
│ > Analyze and Summarize         │
│                                 │
│ Instructions:                   │
│ ┌─────────────────────────────┐ │
│ │ [Editable instructions]     │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Input Sources: 2                │
│ Output Targets: 1               │
│                                 │
│ Status: ● Ready                 │
└─────────────────────────────────┘
  ⚪⚪ Inputs      Outputs ⚪⚪
```

**Features:**
- Multiple input handles
- Multiple output handles
- Editable processing instructions
- Input/output counter
- Processing progress indicator
- Conditional logic support

**Data Structure:**
```typescript
type ProcessorNodeData = {
  label: string;
  instructions: string;
  inputCount: number;
  outputCount: number;
  status: 'ready' | 'processing' | 'complete' | 'error';
  processingStrategy: 'sequential' | 'parallel' | 'conditional';
  color: '6'; // Purple in JSON Canvas
};
```

#### 4.3 Output Node (Yellow)

**Visual Design:**
```
┌─────────────────────────────────┐
│ 📤 Output                        │
├─────────────────────────────────┤
│ > Analysis Results              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Read-only output content]  │ │
│ │                             │ │
│ │ Last updated: 2 min ago     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Copy] [Export] [Clear]         │
└─────────────────────────────────┘
  ⚪ Input
```

**Features:**
- Read-only content display
- Timestamp
- Copy to clipboard button
- Export options
- Clear button
- Markdown rendering
- Auto-scroll to bottom

**Data Structure:**
```typescript
type OutputNodeData = {
  label: string;
  content: string;
  timestamp?: number;
  format: 'markdown' | 'json' | 'plain';
  autoScroll: boolean;
  color: '3'; // Yellow in JSON Canvas
};
```

### Node Styling

#### Theme Integration

```css
/* Light mode */
.flow-canvas-wrapper {
  --node-bg: var(--background-secondary);
  --node-border: var(--background-modifier-border);
  --node-text: var(--text-normal);
  --node-header-bg: var(--background-primary-alt);

  --agent-color: #4CAF50;      /* Green */
  --processor-color: #9C27B0;  /* Purple */
  --output-color: #FF9800;     /* Orange/Yellow */
}

/* Dark mode */
.theme-dark .flow-canvas-wrapper {
  --node-bg: var(--background-secondary);
  --node-border: var(--background-modifier-border);
  --node-text: var(--text-normal);
  --node-header-bg: var(--background-primary-alt);

  --agent-color: #66BB6A;      /* Lighter green */
  --processor-color: #BA68C8;  /* Lighter purple */
  --output-color: #FFB74D;     /* Lighter orange */
}
```

---

## 5. AI Workflow Features

### Workflow Execution System

#### Execution Flow

```
User clicks "Execute"
       ↓
Validate workflow graph
       ↓
Determine execution order (topological sort)
       ↓
For each node in order:
  ├─ If AI Agent: Execute with system prompt
  ├─ If Processor: Process inputs according to instructions
  └─ If Output: Display results
       ↓
Update node statuses in real-time
       ↓
Save results to canvas file
```

#### Real-Time Status Updates

**Features:**
- Live progress indicators on nodes
- Streaming output to output nodes
- Error highlighting
- Execution timeline view
- Cancel execution button

#### Workflow Validation

**Validation Rules:**
1. No circular dependencies
2. All processors have at least one input
3. At least one output node exists
4. AI agents have valid system prompts
5. All connections are valid

### Advanced Features

#### Auto-Layout

**Algorithm:** Dagre (hierarchical layout)

```typescript
function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  // Use dagre for hierarchical layout
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 150 });

  // Add nodes
  nodes.forEach(node => {
    g.setNode(node.id, { width: node.width, height: node.height });
  });

  // Add edges
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Layout
  dagre.layout(g);

  // Update positions
  return nodes.map(node => ({
    ...node,
    position: {
      x: g.node(node.id).x - node.width / 2,
      y: g.node(node.id).y - node.height / 2,
    },
  }));
}
```

#### Templates

**Pre-built Workflow Templates:**

1. **Simple Agent**
   - 1 AI Agent + 1 Output

2. **Agent Pipeline**
   - Input → Agent 1 → Agent 2 → Output

3. **Multi-Agent Brainstorm**
   - 3 Agents (parallel) → Processor (synthesis) → Output

4. **Daily Note Enhancement**
   - Daily Note → Agent (reflection) → Output
   - Daily Note → Agent (questions) → Output

5. **Research Assistant**
   - Query → Agent (research) → Processor (summarize) → Output

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Get basic React Flow canvas working with JSON Canvas compatibility

#### Tasks:
- [ ] Install React Flow package (`@xyflow/react`)
- [ ] Create `FlowCanvasView` extending `ItemView`
- [ ] Implement basic React root rendering
- [ ] Create `FlowCanvas` component with minimal setup
- [ ] Implement `FlowCanvasConverter` class
  - [ ] `toJSONCanvas()` method
  - [ ] `fromJSONCanvas()` method
- [ ] Test bidirectional conversion with existing canvas files
- [ ] Add basic file load/save functionality
- [ ] Register new view type with Obsidian

**Success Criteria:**
- ✅ Can open .canvas files in new React Flow view
- ✅ Can see nodes from existing canvas files
- ✅ Can drag and move nodes
- ✅ Changes save back to .canvas file correctly
- ✅ JSON Canvas format unchanged

**Testing:**
- Load existing example canvas files
- Verify all nodes appear correctly
- Move nodes and verify positions save
- Close and reopen to verify persistence

### Phase 2: Custom Nodes (Week 2-3)

**Goal:** Implement all three custom node types with full functionality

#### Tasks:
- [ ] Create `AIAgentNode` component
  - [ ] Header with icon and label
  - [ ] System prompt editor
  - [ ] Model/temperature controls
  - [ ] Status indicator
  - [ ] Handles (input/output)
- [ ] Create `ProcessorNode` component
  - [ ] Header with icon and label
  - [ ] Instructions editor
  - [ ] Multiple handles
  - [ ] Input/output counters
- [ ] Create `OutputNode` component
  - [ ] Header with icon and label
  - [ ] Content display area
  - [ ] Action buttons (copy/export/clear)
  - [ ] Timestamp
- [ ] Implement node styling with Obsidian theme variables
- [ ] Add node resizing functionality
- [ ] Create node factory functions

**Success Criteria:**
- ✅ All three node types render correctly
- ✅ Nodes styled consistently with Obsidian theme
- ✅ Nodes adapt to light/dark theme changes
- ✅ Interactive elements (buttons, inputs) work
- ✅ Resizing works properly

**Testing:**
- Create one of each node type
- Test all interactive features
- Switch between light/dark themes
- Verify JSON Canvas output contains correct data

### Phase 3: Workflow Execution (Week 3-4)

**Goal:** Implement AI workflow execution system

#### Tasks:
- [ ] Create `useAIWorkflow` hook
  - [ ] Topological sort for execution order
  - [ ] Cycle detection
  - [ ] Validation logic
- [ ] Integrate with existing `AIProcessingService`
- [ ] Implement node status updates
  - [ ] Idle → Processing → Complete/Error
  - [ ] Real-time status display
- [ ] Add execution controls to toolbar
  - [ ] Execute button
  - [ ] Cancel button
  - [ ] Progress indicator
- [ ] Implement streaming output to output nodes
- [ ] Add error handling and display
- [ ] Create execution history/log

**Success Criteria:**
- ✅ Can execute simple workflow (agent → output)
- ✅ Can execute complex workflow (multi-agent → processor → output)
- ✅ Status updates in real-time
- ✅ Output appears in output nodes
- ✅ Errors displayed clearly
- ✅ Can cancel mid-execution

**Testing:**
- Execute all example workflows
- Test error scenarios (invalid prompts, network errors)
- Test cancellation
- Verify output correctness

### Phase 4: Advanced Features (Week 4-5)

**Goal:** Add polish and advanced functionality

#### Tasks:
- [ ] Implement auto-layout functionality
  - [ ] Add Dagre library
  - [ ] Create layout algorithm
  - [ ] Add "Auto-arrange" button
- [ ] Create workflow templates
  - [ ] Template selector UI
  - [ ] Pre-defined template workflows
  - [ ] Template insertion logic
- [ ] Add keyboard shortcuts
  - [ ] `Ctrl+Enter`: Execute workflow
  - [ ] `Delete`: Delete selected nodes
  - [ ] `Ctrl+D`: Duplicate node
  - [ ] `Ctrl+A`: Select all
  - [ ] `Ctrl+Z/Y`: Undo/redo
- [ ] Implement mini-map customization
- [ ] Add context menus (right-click on nodes/edges)
- [ ] Create settings panel for canvas preferences

**Success Criteria:**
- ✅ Auto-layout works and produces good results
- ✅ Templates insert correctly
- ✅ All keyboard shortcuts work
- ✅ Context menus functional
- ✅ Settings persist

**Testing:**
- Test auto-layout with various graph sizes
- Insert each template
- Test all keyboard shortcuts
- Verify context menu actions
- Test settings persistence

### Phase 5: Polish & Migration (Week 5-6)

**Goal:** Prepare for production release and migrate from old system

#### Tasks:
- [ ] Performance optimization
  - [ ] Profile large canvases (100+ nodes)
  - [ ] Optimize re-renders
  - [ ] Add virtualization if needed
- [ ] Update documentation
  - [ ] User guide
  - [ ] Developer documentation
  - [ ] Migration guide
- [ ] Remove old monkey-patching code
  - [ ] Remove `CanvasPatcher`
  - [ ] Remove old context menu code
  - [ ] Clean up unused dependencies
- [ ] Add migration notice for users
- [ ] Create tutorial/onboarding flow
- [ ] Final testing and bug fixes

**Success Criteria:**
- ✅ Performance acceptable with 100+ nodes
- ✅ Documentation complete
- ✅ Old code removed
- ✅ No regressions from previous version
- ✅ Tutorial guides users effectively

**Testing:**
- Performance testing with large graphs
- Full regression testing
- User testing (if possible)
- Cross-platform testing (Windows/Mac/Linux)

---

## 7. Migration Strategy

### Backward Compatibility

**Key Principle:** Zero data migration required

All existing `.canvas` files work immediately with the new system:

1. **Read Compatibility:** `FlowCanvasConverter.fromJSONCanvas()` reads all existing files
2. **Write Compatibility:** `FlowCanvasConverter.toJSONCanvas()` produces valid JSON Canvas
3. **Fallback:** Users can still open files in Obsidian's native canvas

### Coexistence Period

**Dual View Support (Optional):**

```typescript
// Allow users to choose which view to use
this.registerExtensions(['canvas'], 'ai-flow-canvas'); // New view
// Obsidian's native canvas still available via "Open with..."
```

### User Communication

**Changelog Entry:**

```markdown
## v2.0.0 - Canvas Workflow Engine Rewrite

### 🎉 Major Improvements
- **New Canvas Engine:** Built on React Flow for stability and extensibility
- **Better Performance:** Handles large workflows smoothly
- **Enhanced Nodes:** Improved AI agent, processor, and output nodes
- **Auto-Layout:** Automatically arrange complex workflows
- **Templates:** Pre-built workflow templates
- **Real-time Status:** See workflow execution in real-time

### ⚠️ Breaking Changes
- None! All existing canvas files work without modification

### 🔄 Migration
- No action required - your canvas files will work automatically
- The new canvas view will replace the old one
- You can still open files in Obsidian's native canvas if needed
```

---

## 8. Testing Strategy

### Unit Tests

**Coverage Target:** 80%+

#### Components to Test:
```typescript
// Node components
describe('AIAgentNode', () => {
  it('should render with correct data', () => {});
  it('should update system prompt', () => {});
  it('should show correct status', () => {});
});

// Converter
describe('FlowCanvasConverter', () => {
  it('should convert React Flow to JSON Canvas', () => {});
  it('should convert JSON Canvas to React Flow', () => {});
  it('should preserve all node properties', () => {});
  it('should handle missing properties gracefully', () => {});
});

// Hooks
describe('useFlowCanvas', () => {
  it('should load nodes from file', () => {});
  it('should save nodes to file', () => {});
  it('should handle node changes', () => {});
});

describe('useAIWorkflow', () => {
  it('should detect cycles', () => {});
  it('should create execution order', () => {});
  it('should validate workflow', () => {});
});
```

### Integration Tests

**Test Scenarios:**

1. **File Operations:**
   - Load existing canvas file
   - Create new canvas file
   - Save changes to file
   - Handle file not found

2. **Workflow Execution:**
   - Execute simple workflow
   - Execute complex workflow
   - Handle execution errors
   - Cancel execution

3. **Node Operations:**
   - Add node
   - Delete node
   - Update node data
   - Connect nodes
   - Disconnect nodes

### End-to-End Tests

**User Flows:**

1. **Create Workflow from Scratch:**
   - Open new canvas
   - Add AI agent
   - Add processor
   - Add output
   - Connect nodes
   - Execute workflow
   - Verify results

2. **Load and Modify Existing Workflow:**
   - Open existing canvas
   - Add new node
   - Modify connections
   - Execute
   - Save

3. **Template Usage:**
   - Open new canvas
   - Insert template
   - Customize nodes
   - Execute
   - Verify results

### Performance Tests

**Benchmarks:**

| Metric | Target | Test |
|--------|--------|------|
| Load Time (10 nodes) | < 100ms | Load example workflow |
| Load Time (100 nodes) | < 500ms | Load large workflow |
| Render Time (first paint) | < 200ms | Initial render |
| Node Add/Remove | < 50ms | Add/remove operations |
| Workflow Execution (simple) | < 2s | Single agent workflow |
| Auto-save Debounce | 1s | Verify debounce timing |
| Memory Usage | < 50MB | Monitor during use |

---

## 9. Success Criteria

### Must-Have (MVP)

- ✅ All existing canvas files load correctly
- ✅ Can create new canvas files
- ✅ Can add/remove/edit nodes
- ✅ Can connect nodes with edges
- ✅ Changes save to JSON Canvas format
- ✅ AI workflows execute correctly
- ✅ Real-time status updates work
- ✅ Theme integration (light/dark)

### Should-Have

- ✅ Auto-layout functionality
- ✅ Workflow templates
- ✅ Keyboard shortcuts
- ✅ Context menus
- ✅ Mini-map
- ✅ Undo/redo
- ✅ Node resizing

### Nice-to-Have

- ⭐ Workflow execution history
- ⭐ Export workflows as images
- ⭐ Collaborative editing indicators
- ⭐ Performance analytics
- ⭐ Workflow debugging tools

### Acceptance Criteria

#### Performance
- [ ] Loads 100-node canvas in < 500ms
- [ ] Smooth 60fps interactions
- [ ] Auto-save doesn't block UI
- [ ] Memory usage < 50MB typical

#### Functionality
- [ ] All node types work correctly
- [ ] Workflow execution accurate
- [ ] No data loss on save/load
- [ ] Error handling graceful

#### UX
- [ ] Intuitive controls
- [ ] Responsive feedback
- [ ] Clear error messages
- [ ] Help/documentation accessible

#### Quality
- [ ] 80%+ test coverage
- [ ] Zero TypeScript errors
- [ ] No console warnings
- [ ] Accessible (keyboard navigation)

---

## 10. Risk Assessment & Mitigation

### High Risks

#### Risk: React Flow Performance with Large Graphs

**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Implement viewport culling
- Use memoization extensively
- Add virtualization if needed
- Set performance budgets early

#### Risk: JSON Canvas Format Changes

**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Monitor JSON Canvas spec closely
- Version converter logic
- Add format validation
- Maintain backward compatibility

### Medium Risks

#### Risk: User Learning Curve

**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Create comprehensive tutorial
- Add in-app tooltips
- Maintain similar UX to current version
- Provide migration guide

#### Risk: Theme Compatibility

**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Use Obsidian CSS variables exclusively
- Test with popular themes
- Provide custom theme override options
- Document theming system

### Low Risks

#### Risk: React Version Conflicts

**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Already using React 19
- React Flow compatible
- Lock dependency versions
- Test upgrades thoroughly

---

## 11. Next Steps

### Immediate Actions (This Week)

1. **Review and Approve Plan**
   - Stakeholder review
   - Technical review
   - Finalize timeline

2. **Set Up Development Environment**
   - Install React Flow
   - Create branch: `feature/react-flow-canvas`
   - Set up testing framework

3. **Start Phase 1**
   - Create `FlowCanvasView`
   - Implement basic converter
   - Test with existing files

### Communication Plan

**Weekly Updates:**
- Progress report
- Blockers/risks
- Next week's goals

**Milestones:**
- End of each phase
- Demo functionality
- Collect feedback

---

## Appendix A: Dependencies

### New Dependencies to Add

```json
{
  "dependencies": {
    "@xyflow/react": "^12.0.0",
    "dagre": "^0.8.5"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"
  }
}
```

### Existing Dependencies (Keep)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "obsidian": "latest"
  }
}
```

### Dependencies to Remove (After Migration)

```json
{
  "dependencies": {
    "monkey-around": "^2.3.0"  // Remove after cleanup
  }
}
```

---

## Appendix B: File Size Budget

| Category | Current | Target | Delta |
|----------|---------|--------|-------|
| Plugin Bundle | ~150KB | ~250KB | +100KB |
| React Flow | 0KB | ~80KB | +80KB |
| Custom Code | ~50KB | ~70KB | +20KB |
| Total | ~150KB | ~250KB | +100KB |

**Acceptable:** Plugin still under 500KB limit

---

## Appendix C: Browser Compatibility

React Flow supports:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Obsidian minimum requirements align with these.

---

**Document Version:** 1.0
**Last Updated:** 2025-01-19
**Next Review:** After Phase 1 completion

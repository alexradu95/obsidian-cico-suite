# Code Reference Guide - Exact Locations

## Quick Navigation Map

### AI Implementation Files

**AIService (Core AI Logic)**
- Path: `/home/user/obsidian-cico-suite/src/services/AIService.ts`
- Lines: 152 total
- Key methods:
  - `constructor(app: App, settings)` - Lines 25-28
  - `updateSettings(settings)` - Lines 37-39
  - `isDailyNote(file: TFile)` - Lines 51-68
  - `getOpenTabsContext()` - Lines 77-92
  - `getPreviousDailyNotes()` - Lines 104-119
  - `callLMStudio(messages: Message[])` - Lines 136-151

**Main Plugin Entry**
- Path: `/home/user/obsidian-cico-suite/src/main.tsx`
- Lines: 124 total
- Key methods:
  - `onload()` - Lines 37-69 (initialization, event listeners)
  - `isDailyNote(file: TFile)` - Lines 81-83 (delegates to AIService)
  - `loadSettings()` - Lines 92-94
  - `saveSettings()` - Lines 107-110
  - `onunload()` - Lines 119-123 (cleanup)

**Type Definitions (Critical for Understanding Data Model)**
- Path: `/home/user/obsidian-cico-suite/src/types/index.ts`
- Lines: 118 total
- Key interfaces:
  - `Message` - Lines 11-14 (message structure)
  - `PersonalityPreset` - Lines 26 (type union)
  - `DailyAIAssistantSettings` - Lines 34-55 (settings interface)
  - `PERSONALITY_PROMPTS` - Lines 95-117 (system prompts)
  - `DEFAULT_SETTINGS` - Lines 63-74
  - `VIEW_TYPE_AI_ASSISTANT` - Line 82

---

### UI Components

**Main Chat Component (Critical)**
- Path: `/home/user/obsidian-cico-suite/src/components/AIAssistantView.tsx`
- Lines: 628 total
- Context Structures:
  - `ContextData` interface - Lines 19-24
  - `ContextFile` interface - Lines 29-37
- Key hooks/state:
  - Component props - Lines 12-14
  - State initialization - Lines 54-67
  - `loadContext()` - Lines 71-161 (context gathering)
  - `provideInitialGreeting()` - Lines 189-247
  - `sendMessage()` - Lines 378-454 (core message logic)
  - Message rendering - Lines 471-481

**Component Features:**
- Context file management (lines 250-271)
- Temporal context controls (lines 283-300)
- File suggestion system (lines 302-357)
- Context awareness toggle (lines 273-280)
- Keyboard handling (lines 456-461)

**Sidebar View Wrapper**
- Path: `/home/user/obsidian-cico-suite/src/components/SidebarView.tsx`
- Lines: 18 total
- Minimal wrapper that renders AIAssistantView

**Obsidian ItemView Integration**
- Path: `/home/user/obsidian-cico-suite/src/ui/views/SidebarView.tsx`
- Lines: 100 total
- Class: `AIAssistantSidebarView extends ItemView`
- Methods:
  - `constructor(leaf, plugin)` - Lines 36-39
  - `getViewType()` - Lines 47-49
  - `getDisplayText()` - Lines 56-58
  - `onOpen()` - Lines 77-88 (React mounting)
  - `onClose()` - Lines 97-99 (cleanup)

**Settings UI**
- Path: `/home/user/obsidian-cico-suite/src/ui/SettingsTab.tsx`
- Lines: 120 total
- Class: `DailyAIAssistantSettingTab extends PluginSettingTab`
- Methods:
  - `constructor(app, plugin)` - Lines 26-29
  - `display()` - Lines 37-119 (all settings UI construction)
- Settings groups:
  - LM Studio connection - Lines 44-66
  - Assistant behavior - Lines 69-119

---

### Context & Hooks

**App Context (State Sharing)**
- Path: `/home/user/obsidian-cico-suite/src/context/AppContext.tsx`
- Lines: 32 total
- Interface: `AppContextType` - Lines 13-16
- Context creation: `AppContext` - Line 32

**useApp Hook (Context Consumption)**
- Path: `/home/user/obsidian-cico-suite/src/hooks/useApp.tsx`
- Lines: 21 total
- Function: `useApp()` - Lines 15-21

**Error Boundary**
- Path: `/home/user/obsidian-cico-suite/src/components/ErrorBoundary.tsx`
- Lines: 97 total
- Class: `ErrorBoundary extends Component<Props, State>`

---

### Commands

**Command Registration**
- Path: `/home/user/obsidian-cico-suite/src/commands/index.ts`
- Lines: 81 total
- Commands:
  - `registerCommands(plugin)` - Lines 13-19
  - `toggleAssistant(plugin)` - Lines 31-38
  - `showAssistant(plugin)` - Lines 49-64
  - `isAssistantVisible(plugin)` - Lines 78-81

---

### Configuration

**Package.json**
- Path: `/home/user/obsidian-cico-suite/package.json`
- Key dependencies:
  - `react: "^19.2.0"`
  - `react-dom: "^19.2.0"`
  - `obsidian: "latest"`

**Manifest**
- Path: `/home/user/obsidian-cico-suite/manifest.json`
- Plugin ID: `daily-ai-assistant`
- Minimum Obsidian version: `0.15.0`
- Desktop only: `false`

**Styles**
- Path: `/home/user/obsidian-cico-suite/styles.css`
- Lines: 461 total
- AI component classes (lines 1-300):
  - `.ai-assistant-sidebar` - Lines 4-12
  - `.ai-conversation-area` - Lines 41-50
  - `.ai-message` variants - Lines 53-98
  - `.ai-input-container` - Lines 120-151
  - `.ai-context-files` - Lines 209+
  - `.ai-file-suggestions` - Lines 269+

---

## Data Flow Tracing

### User Message Flow

1. **User Input** → `AIAssistantView.tsx` line 600 (textarea)
2. **Send Click** → `sendMessage()` line 378
3. **Context Building** → lines 394-436
4. **API Call** → `AIService.callLMStudio()` line 438
5. **API Request** → `AIService.ts` line 137
6. **Response Processing** → `AIAssistantView.tsx` line 441-444
7. **Display** → Chat history render lines 471-481

### Context Loading Flow

1. **File Change Event** → `main.tsx` line 58
2. **Check Daily Note** → `AIService.isDailyNote()` line 82
3. **Load Context** → `AIAssistantView.loadContext()` line 71
4. **Gather Files** → lines 106-147
5. **Store Context** → `contextData` state line 58
6. **Display Files** → Component render lines 530-576

---

## Key Architectural Patterns

### Service Pattern (AI abstraction)
```
AIService (src/services/AIService.ts)
  ├── callLMStudio() - HTTP abstraction
  ├── isDailyNote() - File identification
  └── getOpenTabsContext() - Context gathering
```

### Context Pattern (State sharing)
```
AppContext (src/context/AppContext.tsx)
  └── useApp hook (src/hooks/useApp.tsx)
       └── Components access app/plugin
```

### Component Pattern (UI structure)
```
AIAssistantSidebarView (ItemView wrapper)
  └── SidebarViewComponent
       └── AIAssistantView (main logic)
            └── ErrorBoundary
```

---

## Settings Persistence Path

Settings flow:
1. User modifies setting in UI → `SettingsTab.tsx` lines 46-118
2. `onChange` callback updates `plugin.settings`
3. `plugin.saveSettings()` called → `main.tsx` lines 107-110
4. Persisted via `this.saveData(settings)`
5. Loaded on startup → `main.tsx` lines 92-94

---

## For Multi-Agent Implementation

### Files to Create

1. **Agent types**: `/src/types/agent.ts` (new)
2. **Agent service**: `/src/services/AgentService.ts` (new)
3. **Agent context**: `/src/context/AgentContext.tsx` (new)
4. **Multi-agent UI**: `/src/components/AgentChatView.tsx` (new)
5. **Network canvas**: `/src/components/AgentNetworkCanvas.tsx` (optional)

### Files to Modify

1. **AppContext** - Add agent registry
2. **AIAssistantView** - Add agent selector
3. **SettingsTab** - Add agent management
4. **types/index.ts** - Add agent types
5. **main.tsx** - Initialize agent service

### Key Extension Points

1. **Message routing**: Extend Message type to include `targetAgentId`
2. **Event system**: Use Obsidian events for agent communication
3. **State management**: Extend React context for agent state
4. **API calls**: Create agent-specific service methods


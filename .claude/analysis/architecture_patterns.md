# Architecture Patterns - Code Examples

## Pattern 1: AI Service Abstraction

### Current Implementation (Single AI)

From `/home/user/obsidian-cico-suite/src/services/AIService.ts`:

```typescript
export class AIService {
    private app: App;
    private settings: DailyAIAssistantSettings;

    constructor(app: App, settings: DailyAIAssistantSettings) {
        this.app = app;
        this.settings = settings;
    }

    // Single API call - stateless
    async callLMStudio(messages: Message[]): Promise<string> {
        const response = await requestUrl({
            url: `${this.settings.lmStudioUrl}/chat/completions`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.settings.modelName || 'local-model',
                messages: messages,
                temperature: this.settings.temperature,
                max_tokens: this.settings.maxTokens,
                stream: false
            })
        });
        return response.json.choices[0]?.message?.content || '';
    }
}
```

### How to Extend for Multi-Agent

```typescript
export class AgentService {
    private agents: Map<string, Agent> = new Map();
    private aiService: AIService;

    async callAgent(agentId: string, messages: Message[]): Promise<string> {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error(`Agent ${agentId} not found`);

        // Prepend agent's system prompt
        const messages_with_system: Message[] = [
            { role: 'system', content: agent.systemPrompt },
            ...messages
        ];

        return this.aiService.callLMStudio(messages_with_system);
    }

    // Multi-agent conversation
    async routeMessage(
        fromAgentId: string,
        targetAgentId: string,
        content: string
    ): Promise<string> {
        // Build context for target agent
        const message: Message = {
            role: 'user',
            content: `${fromAgentId} says: ${content}`
        };
        return this.callAgent(targetAgentId, [message]);
    }
}
```

---

## Pattern 2: Context Management with Files

### Current Implementation (File-based Context)

From `/home/user/obsidian-cico-suite/src/components/AIAssistantView.tsx`:

```typescript
interface ContextFile {
    path: string;
    name: string;
    content?: string;
    isCurrentTab?: boolean;
    isEnabled?: boolean;
    isPastDailyNote?: boolean;
    isFutureDailyNote?: boolean;
}

interface ContextData {
    activeFile: string;
    content: string;
    previousContext: string;
    tabsContext: string;
}

export const AIAssistantView = ({ onClear }: AIAssistantViewProps) => {
    const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
    const [contextData, setContextData] = useState<ContextData | null>(null);

    const loadContext = useCallback(async () => {
        const activeFile = app.workspace.getActiveFile();
        if (!activeFile) {
            setContextData(null);
            setContextFiles(prev => prev.filter(f => !f.isCurrentTab && !f.isPastDailyNote && !f.isFutureDailyNote));
            return;
        }

        try {
            const content = await app.vault.read(activeFile);
            const previousContext = await aiService.getPreviousDailyNotes();
            const tabsContext = await aiService.getOpenTabsContext();

            setContextData({
                activeFile: activeFile.basename,
                content: content.substring(0, 1000),
                previousContext,
                tabsContext
            });
        } catch (error) {
            console.error('Failed to load context:', error);
        }
    }, [app, aiService]);
};
```

### How to Extend for Multi-Agent Context

```typescript
interface AgentContext {
    agentId: string;
    role: string;
    recentMessages: Message[];
    sharedKnowledge: Map<string, string>;
    connectedAgents: string[];
}

interface NetworkContext {
    agents: Map<string, AgentContext>;
    messageHistory: AgentMessage[];
    topologyMap: Map<string, string[]>; // agentId -> connected agentIds
}

// In component
const [networkContext, setNetworkContext] = useState<NetworkContext>({
    agents: new Map(),
    messageHistory: [],
    topologyMap: new Map()
});

const loadNetworkContext = useCallback(async () => {
    const contextFile = app.vault.getAbstractFileByPath('agents-network.json');
    if (contextFile && contextFile instanceof TFile) {
        const content = await app.vault.read(contextFile);
        const network: NetworkContext = JSON.parse(content);
        setNetworkContext(network);
    }
}, [app]);
```

---

## Pattern 3: React Context for State Sharing

### Current Implementation

From `/home/user/obsidian-cico-suite/src/context/AppContext.tsx`:

```typescript
export interface AppContextType {
    app: App;
    plugin: DailyAIAssistantPlugin;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Usage in view:
const root = createRoot(this.contentEl);
this.root.render(
    <StrictMode>
        <ErrorBoundary>
            <AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
                <SidebarViewComponent />
            </AppContext.Provider>
        </ErrorBoundary>
    </StrictMode>
);

// Usage in component:
const { app, plugin } = useApp();
```

### How to Extend for Multi-Agent

```typescript
export interface AgentContextType {
    app: App;
    plugin: DailyAIAssistantPlugin;
    agents: Agent[];
    activeAgentId: string | null;
    agentRegistry: AgentRegistry;
    networkState: NetworkContext;
}

export const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Create hook
export const useAgents = (): AgentContextType => {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgents must be used within AgentContext.Provider');
    }
    return context;
};

// Usage in component
const { agents, activeAgentId, agentRegistry, networkState } = useAgents();
```

---

## Pattern 4: Settings Persistence

### Current Implementation

From `/home/user/obsidian-cico-suite/src/main.tsx`:

```typescript
async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}

async saveSettings() {
    await this.saveData(this.settings);
    this.aiService.updateSettings(this.settings);
}

// From SettingsTab.tsx
new Setting(containerEl)
    .setName('LM Studio URL')
    .setDesc('The URL where LM Studio is running')
    .addText(text => text
        .setPlaceholder('http://localhost:1234/v1')
        .setValue(this.plugin.settings.lmStudioUrl)
        .onChange(async (value) => {
            this.plugin.settings.lmStudioUrl = value;
            await this.plugin.saveSettings();
        }));
```

### How to Extend for Multi-Agent

```typescript
// In types/index.ts
export interface AgentDefinition {
    id: string;
    name: string;
    role: string;
    personality: PersonalityPreset;
    model?: string;
}

export interface DailyAIAssistantSettings {
    // ... existing settings ...
    agents?: AgentDefinition[]; // New field
    agentNetworkMode: 'single' | 'collaborative' | 'hierarchical';
}

// In main.tsx
async loadAgents() {
    const defaultAgents: AgentDefinition[] = [
        {
            id: 'default-agent',
            name: 'Daily Assistant',
            role: 'journaling-assistant',
            personality: 'balanced'
        }
    ];
    
    this.settings.agents = await this.loadData('agents') || defaultAgents;
}

async saveAgents() {
    await this.saveData('agents', this.settings.agents);
}
```

---

## Pattern 5: Event-Driven Architecture

### Current Implementation

From `/home/user/obsidian-cico-suite/src/main.tsx`:

```typescript
async onload() {
    await this.loadSettings();
    this.aiService = new AIService(this.app, this.settings);

    // Register sidebar view
    this.registerView(
        VIEW_TYPE_AI_ASSISTANT,
        (leaf) => (this.sidebarView = new AIAssistantSidebarView(leaf, this))
    );

    // Auto-show on daily notes
    this.registerEvent(
        this.app.workspace.on('file-open', (file) => {
            if (this.settings.autoShowOnDailyNote && file && this.isDailyNote(file)) {
                if (!isAssistantVisible(this)) {
                    showAssistant(this);
                }
            }
        })
    );
}
```

### How to Extend for Multi-Agent

```typescript
async onload() {
    // ... existing code ...

    // Register agent communication event
    this.registerEvent(
        this.app.vault.on('agent-message', (evt: AgentMessageEvent) => {
            this.handleAgentMessage(evt);
        })
    );

    // Register network topology changes
    this.registerEvent(
        this.app.workspace.on('custom:agent-network-change', (topology) => {
            this.updateAgentNetwork(topology);
        })
    );
}

// Custom event handler
private async handleAgentMessage(evt: AgentMessageEvent) {
    const { fromAgent, toAgent, message } = evt;
    
    // Route message to target agent
    const response = await this.agentService.routeMessage(
        fromAgent,
        toAgent,
        message
    );

    // Trigger response event
    this.app.vault.trigger('agent-response', {
        fromAgent: toAgent,
        toAgent: fromAgent,
        message: response
    });
}
```

---

## Pattern 6: Message System

### Current Implementation

From `/home/user/obsidian-cico-suite/src/types/index.ts`:

```typescript
export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Simple message history in component
const [chatHistory, setChatHistory] = useState<Message[]>([]);

// Adding a message
const addMessage = useCallback((role: string, content: string) => {
    const newMessage: Message = {
        role: role as 'system' | 'user' | 'assistant',
        content
    };
    setChatHistory(prev => [...prev, newMessage]);
}, []);

// Sending a message
const sendMessage = useCallback(async () => {
    const userMessage: Message = { role: 'user', content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
        const response = await aiService.callLMStudio(newHistory);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'system', content: 'Error: ' + error.message }]);
    }
}, [chatHistory, aiService]);
```

### How to Extend for Multi-Agent

```typescript
export interface AgentMessage extends Message {
    agentId: string;
    targetAgentId?: string; // For direct agent-to-agent messages
    timestamp: number;
    parentMessageId?: string; // For threading
    metadata?: {
        priority?: 'high' | 'normal' | 'low';
        requiresResponse?: boolean;
        conversationId?: string;
    };
}

// Message queue/routing
export class MessageRouter {
    private messageQueue: AgentMessage[] = [];
    private agents: Map<string, Agent>;

    async routeMessage(message: AgentMessage): Promise<void> {
        if (message.targetAgentId) {
            // Direct routing to specific agent
            await this.deliverToAgent(message.targetAgentId, message);
        } else {
            // Broadcast to all connected agents
            const targets = this.agents.get(message.agentId)?.connections || [];
            for (const targetId of targets) {
                await this.deliverToAgent(targetId, message);
            }
        }
    }

    private async deliverToAgent(agentId: string, message: AgentMessage): Promise<void> {
        // Add to message history
        this.messageQueue.push({
            ...message,
            timestamp: Date.now(),
            agentId: agentId
        });

        // Process message
        const agent = this.agents.get(agentId);
        if (agent) {
            const response = await agent.processMessage(message);
            this.messageQueue.push(response);
        }
    }
}

// In component state
const [messageHistory, setMessageHistory] = useState<AgentMessage[]>([]);
const [messageRouter] = useState(() => new MessageRouter(agents));

const handleAgentMessage = useCallback(async (message: AgentMessage) => {
    await messageRouter.routeMessage(message);
    const updatedHistory = await messageRouter.getMessageHistory();
    setMessageHistory(updatedHistory);
}, [messageRouter]);
```

---

## Pattern 7: Component Composition

### Current Implementation

From `/home/user/obsidian-cico-suite/src/ui/views/SidebarView.tsx`:

```typescript
async onOpen() {
    this.root = createRoot(this.contentEl);
    this.root.render(
        <StrictMode>
            <ErrorBoundary>
                <AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
                    <SidebarViewComponent />
                </AppContext.Provider>
            </ErrorBoundary>
        </StrictMode>
    );
}

// SidebarViewComponent is minimal
export const SidebarView = () => {
    return (
        <div className="ai-assistant-sidebar">
            <AIAssistantView />
        </div>
    );
};
```

### How to Extend for Multi-Agent

```typescript
// Create agent-specific views
export const MultiAgentView = () => {
    const { agents, activeAgentId } = useAgents();

    return (
        <div className="ai-multi-agent-container">
            <div className="ai-agent-selector">
                {agents.map(agent => (
                    <button
                        key={agent.id}
                        className={`ai-agent-tab ${activeAgentId === agent.id ? 'active' : ''}`}
                        onClick={() => switchAgent(agent.id)}
                    >
                        {agent.name}
                    </button>
                ))}
            </div>

            <div className="ai-agent-chat">
                {activeAgentId && <AgentChatView agentId={activeAgentId} />}
            </div>

            {/* Optional: Network visualization */}
            <div className="ai-network-panel">
                <AgentNetworkCanvas agents={agents} />
            </div>
        </div>
    );
};

// Agent-specific chat view
interface AgentChatViewProps {
    agentId: string;
}

export const AgentChatView = ({ agentId }: AgentChatViewProps) => {
    const { agents, messageHistory } = useAgents();
    const agent = agents.find(a => a.id === agentId);

    // Filter messages for this agent
    const agentMessages = messageHistory.filter(
        m => m.agentId === agentId || m.targetAgentId === agentId
    );

    return (
        <div className="ai-agent-chat-view">
            <div className="ai-conversation-area">
                {agentMessages.map((msg, idx) => (
                    <AgentMessageComponent key={idx} message={msg} />
                ))}
            </div>
            <AgentInputArea agentId={agentId} />
        </div>
    );
};
```

---

## Summary: Minimal Changes Needed

The existing architecture supports multi-agent extension with these minimal changes:

1. **Add agent types** - New file, no breaking changes
2. **Create AgentService** - Parallel to AIService, uses same AIService
3. **Extend AppContext** - Add new properties, backward compatible
4. **Modify UIComponents** - Add agent selector, parallel to existing UI
5. **Extend Message type** - Add optional agentId field

The plugin can operate in both:
- **Single-agent mode** (current) - Full backward compatibility
- **Multi-agent mode** (new) - Opt-in via settings


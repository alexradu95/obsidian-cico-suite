# AI Canvas Workflows for Obsidian

Create visual AI processing workflows using Obsidian's native canvas. Connect nodes, define processing steps, and watch AI transform your information in real-time.

## Features

- 🎨 **Visual Workflows**: Design AI processing flows on canvas with drag-and-drop nodes
- 🔀 **Multi-Agent Processing**: Combine multiple AI perspectives in a single workflow
- 🤖 **Flexible AI Processing**: Define custom instructions for any transformation
- 📊 **Real-Time Results**: See AI-processed output update directly on canvas
- 🔗 **Node-Based Architecture**: Connect inputs, processors, and outputs visually
- 🌐 **JSON Canvas Format**: Uses Obsidian's standard canvas format
- 🔐 **Privacy-First**: All processing happens locally via LM Studio

## Privacy & Network Usage

⚠️ **Important**: This plugin makes network requests to a local LM Studio server.

### Network Calls
- **Destination**: Configurable LM Studio URL (default: `http://localhost:1234/v1`)
- **Data Sent**: Canvas node contents and processing instructions
- **Purpose**: To generate AI-powered responses
- **Default Behavior**: Network calls only when you explicitly run "Process AI Node in Canvas"

### Privacy Considerations
- All data is sent to **your local LM Studio instance** by default
- No data is sent to external services unless you configure a remote LM Studio URL
- Canvas contents are only processed when you explicitly trigger processing
- No telemetry or analytics are collected

### Required Setup
1. Install and run [LM Studio](https://lmstudio.ai/)
2. Load a language model in LM Studio
3. Start the local server in LM Studio (default: `http://localhost:1234`)
4. Configure the plugin settings to match your LM Studio URL

## Installation

### From Obsidian Community Plugins (Coming Soon)
1. Open Obsidian Settings
2. Navigate to **Community plugins**
3. Search for "AI Canvas Workflows"
4. Click **Install**
5. Enable the plugin

### Manual Installation
1. Download the latest release from GitHub
2. Extract the files to `<vault>/.obsidian/plugins/ai-canvas-workflows/`
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Quick Start

### 1. Set Up LM Studio
1. Install and run [LM Studio](https://lmstudio.ai/)
2. Load a model
3. Start the server (default port: 1234)
4. Go to plugin settings and verify the LM Studio URL

### 2. Try an Example
1. Copy an example from the `examples/` folder to your vault
2. Open it in Obsidian
3. Press `Ctrl/Cmd + P` → "Process AI Node in Canvas"
4. Watch the AI process the workflow!

### 3. Create Your Own
1. Create a new canvas
2. Add nodes:
   - **Input node** (any text node) - your data
   - **AI Processing node** (purple) - what to do
   - **Output node** (yellow) - results
3. Connect them with arrows
4. Run "Process AI Node in Canvas"

## Usage

### Basic Workflow Pattern

\`\`\`
[Input Node] → [AI Processing Node] → [Output Node]
\`\`\`

### Creating an AI Processing Node

Add a text node with this format:

\`\`\`
# 🤖 [Title]

**AI Processing Node**

[Your instructions for the AI]

---
\`\`\`

**Example:**
\`\`\`
# 🤖 Summarizer

**AI Processing Node**

Summarize the input in 3 bullet points.
Focus on key insights and actionable items.

---
\`\`\`

### Running a Workflow

1. Connect nodes: Input → Processing → Output
2. Open Command Palette (\`Ctrl/Cmd + P\`)
3. Type "Process AI"
4. Select "Process AI Node in Canvas"
5. Results appear in output nodes!

### Commands

- **Create/Open AI Canvas**: Create a new canvas with default assistant
- **Add Default Assistant to Canvas**: Add the Romanian assistant node (when canvas is open)
- **Process AI Node in Canvas**: Process all AI workflows in active canvas

### Canvas Context Menus ✨

The plugin adds intelligent context menus directly to your canvas:

#### **Right-Click on Canvas Nodes**
- **Convert to AI Agent**: Turn any text node into a green AI agent
- **Add AI Processing Node**: Create a connected purple processor node

#### **Right-Click on Canvas Edges**
- **Insert AI Processing Node**: Add a processor between two connected nodes

#### **Right-Click on Canvas Background**
- **Add AI Agent**: Create a new green agent node
- **Add AI Processing Node**: Create a new purple processor
- **Add Output Node**: Create a new yellow output node

### Additional Ways to Add Nodes

1. **Command Palette** (Active canvas):
   - Press `Ctrl/Cmd + P`
   - Type "Add Default Assistant" or "Add AI Processing Node"

2. **Right-Click Canvas File** (File explorer):
   - Right-click a `.canvas` file in the sidebar
   - Select node type to add

3. **Ribbon Icon**:
   - Click the workflow icon to create/open AI Canvas

**Technical Note**: This plugin uses advanced monkey-patching techniques to extend Obsidian's internal Canvas API. While powerful, these techniques rely on undocumented internal APIs that may change with Obsidian updates.

### Advanced Patterns

#### Multiple Inputs
Combine information from multiple sources:
\`\`\`
[Input 1] ─┐
[Input 2] ─┼→ [Processing] → [Output]
[Input 3] ─┘
\`\`\`

#### Multiple Outputs
Generate different views of the same data:
\`\`\`
               ┌→ [Summary]
[Input] → [Processing] ─┤
               └→ [Questions]
\`\`\`

#### Chained Processing
Process data in multiple steps:
\`\`\`
[Input] → [Step 1] → [Step 2] → [Final Output]
\`\`\`

#### Parallel Processing
Apply different processors to the same input:
\`\`\`
               ┌→ [Analyze] → [Analysis Output]
[Input] ───────┤
               └→ [Translate] → [Translation Output]
\`\`\`

## Examples

The \`examples/\` folder contains ready-to-use workflows:

- **\`hello-world.canvas\`** ⭐ - Simplest workflow (start here!)
- **\`example-ai-workflow.canvas\`** - Agent analysis
- **\`multi-agent-brainstorm.canvas\`** - Multi-perspective synthesis
- **\`daily-note-enhancement.canvas\`** - Daily note reflection

See [examples/QUICKSTART.md](examples/QUICKSTART.md) for a detailed tutorial.

## Configuration

### LM Studio Connection
- **LM Studio URL**: The URL where your LM Studio server is running (default: \`http://localhost:1234/v1\`)
- **Model Name**: Optional model identifier (leave empty for auto-detection)
- **Max Response Tokens**: Maximum length of AI responses (50-500)
- **Temperature**: Controls creativity of responses (0.0-1.0)

## Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- LM Studio with a loaded language model

### Setup
\`\`\`bash
# Install dependencies
npm install

# Start development mode (with watch)
npm run dev

# Build for production
npm run build

# Run tests
npm test
\`\`\`

### Project Structure
\`\`\`
src/
├── main.tsx              # Plugin entry point
├── types/                # TypeScript type definitions
│   └── jsoncanvas.ts     # JSON Canvas format types
├── services/             # Business logic
│   ├── AIService.ts      # LM Studio API integration
│   ├── CanvasService.ts  # Canvas file operations
│   └── AIProcessingService.ts  # AI workflow processing
├── commands/             # Command implementations
└── ui/
    └── SettingsTab.tsx   # Settings interface
examples/                 # Example canvas workflows
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the [examples/](examples/) folder for working examples
2. Review the [examples/QUICKSTART.md](examples/QUICKSTART.md) tutorial
3. Check the [GitHub Issues](https://github.com/yourusername/ai-canvas-workflows/issues)
4. Create a new issue with details about your problem

## Acknowledgments

- Built with [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- Uses [JSON Canvas](https://jsoncanvas.org/) open format
- Integrates with [LM Studio](https://lmstudio.ai/) for local AI processing

---

**Note**: This plugin requires a local LM Studio instance to function. No cloud services or external APIs are used by default, ensuring your notes remain private and local.

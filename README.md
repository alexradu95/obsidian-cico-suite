# Daily AI Assistant for Obsidian

An AI-powered assistant that proactively engages you with thoughtful questions when opening your daily notes, helping you reflect on your day.

## Features

- 🤖 **AI-Powered Reflections**: Get personalized questions and insights based on your daily notes
- 📝 **Daily Note Integration**: Automatically activates when you open daily notes
- 💬 **Interactive Chat**: Have natural conversations with the AI about your day
- 🎨 **Multiple Personalities**: Choose from concise, balanced, reflective, or poetic response styles
- 📌 **Sidebar Integration**: Clean integration as a sidebar panel in your workspace
- 🎯 **Context-Aware**: Analyzes previous daily notes and open tabs for better insights
- 🌐 **Mobile Compatible**: Works on both desktop and mobile devices

## Privacy & Network Usage

⚠️ **Important**: This plugin makes network requests to a local LM Studio server.

### Network Calls
- **Destination**: Configurable LM Studio URL (default: `http://localhost:1234/v1`)
- **Data Sent**: Your daily note content, previous notes summaries, and chat messages
- **Purpose**: To generate AI-powered reflections and responses
- **Default Behavior**: Network calls only happen when you explicitly use the "Analyze" feature or send a chat message

### Privacy Considerations
- All data is sent to **your local LM Studio instance** by default
- No data is sent to external services unless you configure a remote LM Studio URL
- Your vault contents are only processed when you explicitly request analysis
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
3. Search for "Daily AI Assistant"
4. Click **Install**
5. Enable the plugin

### Manual Installation
1. Download the latest release from GitHub
2. Extract the files to `<vault>/.obsidian/plugins/daily-ai-assistant/`
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Configuration

### LM Studio Connection
- **LM Studio URL**: The URL where your LM Studio server is running (default: `http://localhost:1234/v1`)
- **Model Name**: Optional model identifier (leave empty for auto-detection)

### Assistant Behavior
- **Auto-show on daily note**: Automatically display the assistant when opening a daily note
- **Assistant Personality**: Choose how the assistant responds:
  - **Concis** - Short and direct (1-2 sentences)
  - **Echilibrat** - Friendly and thoughtful (2-3 sentences)
  - **Reflectiv** - Deep insights and meaningful questions (3-4 sentences)
  - **Poetic** - Creative and expressive with metaphors
- **Include Open Tabs Context**: Include content from your open tabs in analysis

### Conversation Settings
- **Days of context**: Number of previous daily notes to consider (1-14)
- **Max response tokens**: Maximum length of AI responses (50-500)
- **Temperature**: Controls creativity of responses (0.0-1.0)

## Usage

### Basic Usage
1. Open a daily note (format: `YYYY-MM-DD.md`)
2. The AI Assistant will automatically appear (if enabled in settings)
3. The assistant automatically loads context from your notes and provides insights
4. Type a question or message to have a conversation

### Commands
- **Toggle AI Assistant**: Show/hide the assistant sidebar

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line in message

## Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- LM Studio with a loaded language model

### Setup
```bash
# Install dependencies
npm install

# Start development mode (with watch)
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── main.tsx              # Plugin entry point
├── types/                # TypeScript type definitions
├── services/             # Business logic (AI service)
├── commands/             # Command implementations
├── context/              # React Context
├── hooks/                # Custom React hooks
├── components/           # React UI components
└── ui/
    ├── views/            # Obsidian view wrappers
    └── SettingsTab.tsx   # Settings interface
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the [GitHub Issues](https://github.com/yourusername/daily-ai-assistant/issues)
2. Create a new issue with details about your problem
3. Include your Obsidian version and plugin version

## Acknowledgments

- Built with [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- Uses [React](https://react.dev/) for UI components
- Integrates with [LM Studio](https://lmstudio.ai/) for local AI processing

---

**Note**: This plugin requires a local LM Studio instance to function. No cloud services or external APIs are used by default, ensuring your notes remain private and local.

# Daily AI Assistant for Obsidian

An intelligent Obsidian plugin that proactively engages you with thoughtful questions when you open your daily notes, helping you reflect on your day with AI-powered insights using LM Studio.

## Features

- **Automatic Daily Note Detection**: Automatically detects when you open a daily note (format: YYYY-MM-DD)
- **AI-Powered Conversations**: Uses LM Studio for local AI inference
- **Context-Aware Questions**: Analyzes previous daily notes to ask relevant, personalized questions
- **Beautiful Chat Interface**: Modern, responsive chat modal with real-time status updates
- **Save to Note**: Easily save your reflection conversation directly to your daily note
- **100% Local & Private**: All AI processing happens on your machine - no data sent to external servers
- **Easy Setup**: Works with LM Studio's simple local server

## Installation

### Prerequisites

1. **LM Studio**: Download and install from [https://lmstudio.ai/](https://lmstudio.ai/)
2. **A Model**: Download a model in LM Studio (recommended: Llama 3.2 1B or 3B)

### Plugin Installation

Since this plugin is in your `.obsidian/plugins` directory:

1. **Install Dependencies**
   ```bash
   cd .obsidian/plugins/daily-ai-assistant
   npm install
   ```

2. **Build the Plugin**
   ```bash
   npm run build
   ```

3. **Enable the Plugin**
   - Open Obsidian Settings
   - Go to Community Plugins (disable Safe Mode if needed)
   - Find "Daily AI Assistant" in your installed plugins
   - Toggle it on

## Setup LM Studio

### Step 1: Install and Download Model

1. Download [LM Studio](https://lmstudio.ai/)
2. Open LM Studio
3. Click the "Search" (🔍) icon
4. Search for and download a model:
   - **Recommended**: `llama-3.2-1b-instruct` (fast, 1GB)
   - **Better Quality**: `llama-3.2-3b-instruct` (slower, 3GB)
   - **Lightweight**: `qwen2.5-0.5b-instruct` (very fast, 500MB)

### Step 2: Start the Server

1. Click the "↔" (Server) icon in LM Studio
2. Click "Start Server"
3. You should see: **"Server running at http://localhost:1234"**
4. Leave LM Studio running in the background

### Step 3: Configure Plugin

1. In Obsidian, go to Settings → Daily AI Assistant
2. Click "Test Connection"
3. If successful, you'll see the connected model
4. You're ready to use the assistant!

## Usage

### Automatic Mode

1. Create or open a daily note with format `YYYY-MM-DD.md` (e.g., `2025-11-17.md`)
2. The AI Assistant will automatically pop up
3. Answer the questions naturally
4. Click "Save to Note" when done to add the conversation to your daily note

### Manual Mode

You can also manually open the assistant:
- Click the 💬 icon in the left ribbon, or
- Use the command palette: "Open AI Assistant"

### Conversation Tips

- Press **Enter** to send a message
- Press **Shift + Enter** to add a new line
- The AI considers context from your previous 7 daily notes (configurable)
- Be as detailed or brief as you like - the AI adapts to your style

## Settings

Access settings via: Settings → Community Plugins → Daily AI Assistant

### LM Studio Connection

| Setting | Description | Default |
|---------|-------------|---------|
| LM Studio URL | The URL where LM Studio is running | http://localhost:1234/v1 |
| Model Name | The model identifier (auto-detected) | Auto |
| Test Connection | Button to verify LM Studio is running | - |

### Conversation Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-show on daily note | Automatically open assistant on daily notes | Enabled |
| Days of context | Previous daily notes to consider | 7 days |
| Max response tokens | Maximum length of AI responses | 150 |
| Temperature | Controls creativity (0.0-1.0) | 0.7 |

## How It Works

### Daily Note Detection

The plugin watches for files matching the pattern `YYYY-MM-DD.md`:
- `2025-11-17.md` ✓
- `2025-01-15.md` ✓
- `My Daily Note.md` ✗

### Context Gathering

When you open the assistant, it:
1. Finds your previous daily notes (up to the configured number of days)
2. Extracts summaries from each note (first 300 characters)
3. Provides this context to the AI for more relevant questions

### AI Processing

All AI inference happens locally using:
- **LM Studio**: Local LLM server with OpenAI-compatible API
- **Your Hardware**: Uses your CPU/GPU for inference
- **No Internet Required**: After model download, works completely offline

## Privacy & Data

**100% Local Processing**
- No data is ever sent to external servers
- All AI models run entirely on your device via LM Studio
- Your journal entries remain completely private
- No internet connection required after initial model download

## Troubleshooting

### Plugin Doesn't Load

1. Make sure you've run `npm install` and `npm run build`
2. Check that `main.js`, `manifest.json`, and `styles.css` exist
3. Try disabling and re-enabling the plugin
4. Check the Developer Console (Ctrl+Shift+I) for errors

### Cannot Connect to LM Studio

**Error**: "Cannot connect to LM Studio"

**Solutions**:
1. Make sure LM Studio is running
2. Load a model in LM Studio
3. Click the "↔" icon and start the server
4. Verify you see "Server running at http://localhost:1234"
5. Click "Test Connection" in plugin settings

### Slow Performance

- Try switching to a smaller model (Qwen 0.5B or Llama 1B)
- Reduce "Max response tokens" in settings
- Reduce "Days of context" in settings
- Close other applications to free up resources
- In LM Studio, try enabling GPU acceleration if available

### Assistant Doesn't Auto-Show

- Check that "Auto-show on daily note" is enabled in settings
- Verify your daily note filename matches `YYYY-MM-DD` format exactly
- The plugin needs a moment to initialize - wait 1-2 seconds after opening a note

### Responses Are Generic

- The AI needs context! Make sure you have previous daily notes
- Increase "Days of context" in settings to provide more history
- Try a larger model for better understanding

## System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB+ recommended)
- **Disk Space**: 1-5GB for model storage
- **LM Studio**: Latest version

### Recommended Models by Hardware

- **8GB RAM**: Qwen 0.5B or Llama 1B
- **16GB RAM**: Llama 3B or Phi 3
- **32GB+ RAM**: Llama 7B or larger

## Known Limitations

- **LM Studio Required**: Plugin needs LM Studio running in the background
- **Response time**: 2-15 seconds per response depending on model and hardware
- **Model size**: Requires 500MB-7GB of disk space depending on model choice
- **Daily note format**: Only recognizes `YYYY-MM-DD` filename pattern
- **Single conversation**: Doesn't remember across different assistant sessions

## Roadmap

Potential future improvements:

- [ ] Streaming responses for real-time text generation
- [ ] Custom daily note format detection
- [ ] Memory of previous conversations across days
- [ ] Customizable AI personality/prompts
- [ ] Export conversations to separate files
- [ ] Support for other local LLM servers (Ollama, LocalAI)

## Development

### Project Structure

```
daily-ai-assistant/
├── main.ts              # Main plugin code
├── styles.css           # UI styles
├── manifest.json        # Plugin metadata
├── package.json         # Dependencies
├── esbuild.config.mjs   # Build configuration
└── README.md           # This file
```

### Development Mode

```bash
npm run dev
```

This starts esbuild in watch mode - any changes to `main.ts` will automatically rebuild `main.js`.

### Building for Production

```bash
npm run build
```

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - feel free to modify and distribute as you wish.

## Credits

Built with:
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [LM Studio](https://lmstudio.ai/) - Local LLM server
- AI Models: Llama 3.2, Phi 3, Qwen, and more

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages (Ctrl+Shift+I)
3. Make sure LM Studio is running and the server is started
4. Try rebuilding: `npm run build`

---

**Enjoy more meaningful daily reflections with your AI assistant!** 🤖✨

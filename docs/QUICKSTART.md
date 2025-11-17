# Quick Start Guide - Daily AI Assistant

## Getting Started in 4 Easy Steps

### Step 1: Install LM Studio

1. Download [LM Studio](https://lmstudio.ai/) for your operating system
2. Install and open LM Studio
3. Click the Search (🔍) icon
4. Download a model:
   - **Quick Start**: Search for `llama-3.2-1b` and download
   - **Better Quality**: `llama-3.2-3b` (requires more RAM)
   - **Fastest**: `qwen2.5-0.5b`

### Step 2: Start LM Studio Server

1. In LM Studio, click the **"↔" (Server)** icon on the left
2. Click **"Start Server"**
3. You should see: **"Server running at http://localhost:1234"**
4. Keep LM Studio running!

### Step 3: Enable the Plugin

The plugin is already built! Just enable it:

1. Open **Obsidian Settings** (gear icon or `Ctrl/Cmd + ,`)
2. Navigate to **Community Plugins**
3. If you see "Safe mode" enabled, turn it off
4. Find **"Daily AI Assistant"** in your installed plugins list
5. Toggle it **ON**
6. Go to plugin settings and click **"Test Connection"**
7. You should see: "✓ Successfully connected to LM Studio!"

### Step 4: Use It!

1. Create or open a daily note (filename must be: `2025-11-17.md`)
2. The AI Assistant modal will pop up automatically
3. Start chatting with the AI!
4. Click **"Save to Note"** when done

## That's It!

From now on:
- The assistant appears automatically when you open daily notes
- LM Studio needs to be running in the background
- You can customize everything in settings

## Quick Tips

### Manual Access
Don't want to wait for a daily note? Open the assistant anytime:
- Click the 💬 icon in the left sidebar, OR
- Open Command Palette (`Ctrl/Cmd + P`) and type "Open AI Assistant"

### Change Settings
Go to: **Settings → Community Plugins → Daily AI Assistant**

Try adjusting:
- **Max tokens**: Lower to 100 for faster replies
- **Days of context**: Reduce to 3 if you don't need much history
- **Temperature**: Lower (0.3) for focused responses, higher (0.9) for creative ones

### Switch Models
In LM Studio:
1. Click the "💬" (Chat) icon
2. Select a different model from the dropdown at the top
3. The plugin will use whatever model is currently loaded

### Disable Auto-Show
If you don't want the assistant to pop up automatically:
- Settings → Community Plugins → Daily AI Assistant
- Turn off "Auto-show on daily note"

## Troubleshooting

### "Cannot connect to LM Studio"
1. **Is LM Studio running?** Check if the app is open
2. **Is the server started?** Click the "↔" icon and start the server
3. **Is a model loaded?** Make sure you see a model selected in LM Studio
4. **Click Test Connection** in plugin settings to verify

### Plugin doesn't appear
- Make sure your filename is exactly `YYYY-MM-DD.md` (like `2025-11-17.md`)
- Check that "Auto-show on daily note" is enabled in settings

### Responses are slow
- Try a smaller model (Qwen 0.5B is very fast)
- Reduce max tokens to 100 or less
- Close other applications to free up RAM
- In LM Studio, try enabling GPU acceleration

### Responses are generic/not helpful
- Make sure you have previous daily notes with content
- Increase "Days of context" in settings for more history
- Try a larger, better model (Llama 3B instead of 1B)

## Model Recommendations

**If you have 8GB RAM**:
- Use: Qwen 0.5B or Llama 1B
- Fast responses, good for journaling

**If you have 16GB RAM**:
- Use: Llama 3B or Phi 3
- Better understanding, still fast

**If you have 32GB+ RAM**:
- Use: Llama 7B or larger
- Best quality, slower but very insightful

## Still stuck?

1. Press `Ctrl+Shift+I` to open Developer Console
2. Look for error messages (in red)
3. Make sure LM Studio shows "Server running"
4. Check the full [README.md](README.md) for detailed help

---

Enjoy your AI-powered journaling! 📝✨

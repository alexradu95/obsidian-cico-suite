# LM Studio Integration Guide

## Overview

The Daily AI Assistant now uses **LM Studio** for local AI inference. This provides a reliable, easy-to-use solution that works perfectly with Obsidian's plugin architecture.

## Why LM Studio?

### Advantages Over WebLLM/Transformers.js

✅ **No Bundling Issues** - Simple HTTP API calls
✅ **Better Performance** - Native compiled models with GPU support
✅ **Easy Setup** - User-friendly GUI for model management
✅ **Reliable** - No Electron/browser compatibility issues
✅ **Flexible** - Easy to switch models without changing code
✅ **100% Local** - All processing happens on your machine

### Technical Benefits

- **OpenAI-Compatible API**: Standard interface, easy to work with
- **requestUrl API**: Uses Obsidian's built-in HTTP client (no CORS issues)
- **Connection Testing**: Built-in test button to verify setup
- **Auto-Detection**: Automatically detects loaded models
- **Error Handling**: Clear error messages when LM Studio isn't running

## Architecture

### Plugin → LM Studio Communication

```
┌─────────────┐         HTTP API         ┌─────────────┐
│   Obsidian  │ ───────────────────────> │  LM Studio  │
│   Plugin    │  localhost:1234/v1       │   Server    │
│             │ <─────────────────────── │             │
└─────────────┘       JSON Response       └─────────────┘
```

### API Endpoints Used

1. **GET** `/v1/models` - List available models
2. **POST** `/v1/chat/completions` - Generate responses

### Request Format

```typescript
{
  model: string,              // Model identifier
  messages: Message[],        // Conversation history
  temperature: number,        // 0.0-1.0
  max_tokens: number,        // Maximum response length
  stream: false              // No streaming (yet)
}
```

### Response Format

```typescript
{
  choices: [{
    message: {
      role: "assistant",
      content: string        // AI response
    }
  }],
  usage: { /* token counts */ }
}
```

## Implementation Details

### Connection Check

```typescript
async checkLMStudioConnection(): Promise<boolean> {
  try {
    const response = await requestUrl({
      url: `${this.settings.lmStudioUrl}/models`,
      method: 'GET',
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
```

### Model Detection

```typescript
async getAvailableModels(): Promise<string[]> {
  const response = await requestUrl({
    url: `${this.settings.lmStudioUrl}/models`,
    method: 'GET',
  });
  return response.json.data.map((model: {id: string}) => model.id);
}
```

### Chat Completion

```typescript
async callLMStudio(messages: Message[]): Promise<string> {
  const response = await requestUrl({
    url: `${this.settings.lmStudioUrl}/chat/completions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: this.settings.modelName,
      messages: messages,
      temperature: this.settings.temperature,
      max_tokens: this.settings.maxTokens,
      stream: false
    })
  });
  return response.json.choices[0]?.message?.content || '';
}
```

## User Setup Flow

### 1. Install LM Studio
User downloads from https://lmstudio.ai/

### 2. Download a Model
User clicks Search icon and downloads a model (e.g., Llama 3.2 1B)

### 3. Start Server
User clicks Server icon and starts the server (localhost:1234)

### 4. Test Connection
User enables plugin and clicks "Test Connection" in settings

### 5. Start Using
Plugin automatically works when daily notes are opened

## Error Handling

### Connection Failed
**Scenario**: LM Studio not running or server not started

**Detection**: `requestUrl` throws error or returns non-200 status

**User Message**:
```
Cannot connect to LM Studio. Please:
1. Make sure LM Studio is running
2. Load a model in LM Studio
3. Check that the server is started
4. Try again
```

### No Model Loaded
**Scenario**: Server running but no model loaded

**Detection**: API returns empty model list

**User Message**: Prompt user to load a model in LM Studio

### API Error
**Scenario**: Server returns error status

**Detection**: Non-200 status code

**User Message**: Display the error message from LM Studio

## Settings Configuration

### LM Studio URL
- Default: `http://localhost:1234/v1`
- Allows custom port if user changed it

### Model Name
- Auto-detected from loaded model
- Can be manually specified
- Falls back to "local-model" if empty

### Temperature
- Range: 0.0 (focused) to 1.0 (creative)
- Default: 0.7 (balanced)

### Max Tokens
- Range: 50-500
- Default: 150
- Controls response length

## Future Enhancements

### Potential Improvements

- [ ] **Streaming Support**: Real-time token-by-token responses
- [ ] **Model Switching**: In-plugin model selection
- [ ] **Performance Metrics**: Show tokens/second, latency
- [ ] **Context Window Info**: Display max context length
- [ ] **Multiple Backends**: Support Ollama, LocalAI
- [ ] **Fallback Options**: Chain multiple local servers

### Streaming Implementation (Future)

```typescript
// Potential streaming approach
async function streamResponse(messages: Message[]) {
  const response = await requestUrl({
    url: `${url}/chat/completions`,
    method: 'POST',
    body: JSON.stringify({ ...params, stream: true })
  });

  // Would need to handle Server-Sent Events (SSE)
  // This requires more complex handling of chunked responses
}
```

## Comparison with Alternatives

| Feature | LM Studio | WebLLM | Ollama | External API |
|---------|-----------|--------|--------|--------------|
| **Setup** | GUI Download | None (bundled) | CLI Install | API Key |
| **Compatibility** | ✅ Perfect | ❌ Bundling issues | ✅ Good | ✅ Perfect |
| **Performance** | ✅ Fast | ⚠️ Slower | ✅ Fast | ✅ Very Fast |
| **Privacy** | ✅ 100% Local | ✅ 100% Local | ✅ 100% Local | ❌ Remote |
| **User Experience** | ✅ Excellent | ❌ Complex | ⚠️ CLI-based | ✅ Simple |
| **Model Management** | ✅ GUI | ❌ Manual | ⚠️ CLI | N/A |
| **Cost** | ✅ Free | ✅ Free | ✅ Free | 💰 Paid |

## Testing

### Manual Testing Checklist

- [ ] LM Studio not running → Show error message
- [ ] LM Studio running, no model → Show error message
- [ ] LM Studio running with model → Connect successfully
- [ ] Test Connection button → Shows correct status
- [ ] Model auto-detection → Populates model name
- [ ] Send message → Receives response
- [ ] Save to note → Appends correctly
- [ ] Custom URL → Works with different port
- [ ] Temperature/tokens settings → Affect responses

## Troubleshooting for Developers

### Plugin won't load
- Check `npm run build` completed without errors
- Verify `main.js` exists
- Check browser console for errors

### Connection test fails
- Verify LM Studio is actually running
- Check server is started (look for green indicator)
- Try `curl http://localhost:1234/v1/models` in terminal
- Check firewall isn't blocking localhost

### Responses are empty
- Verify model is loaded in LM Studio
- Check max_tokens isn't too low
- Look at LM Studio console for errors
- Try same request in LM Studio's playground

### Type errors
- Make sure Obsidian types are up to date: `npm update obsidian`
- Check TypeScript version compatibility
- Use `// @ts-ignore` sparingly for edge cases

## Resources

- **LM Studio**: https://lmstudio.ai/
- **LM Studio Docs**: https://lmstudio.ai/docs
- **OpenAI API Reference**: https://platform.openai.com/docs/api-reference
- **Obsidian API**: https://github.com/obsidianmd/obsidian-api

---

**This implementation provides the best balance of simplicity, reliability, and user experience for local AI in Obsidian plugins.**

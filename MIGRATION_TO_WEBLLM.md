# Migration to WebLLM

## What Changed?

The Daily AI Assistant plugin has been migrated from Transformers.js to WebLLM for better performance and compatibility with Obsidian's Electron environment.

## Why WebLLM?

### Previous Issues with Transformers.js
- ❌ File system path errors in Electron environment
- ❌ Node.js dependencies not compatible with browser context
- ❌ Complex environment detection causing crashes
- ❌ Limited GPU acceleration

### Benefits of WebLLM
- ✅ **WebGPU Acceleration**: Leverages your GPU for 5-10x faster inference
- ✅ **Browser-Native**: Designed specifically for web/Electron environments
- ✅ **Better Models**: Access to newer Llama 3.2, Phi 3.5, and Qwen models
- ✅ **Reliable Caching**: Uses browser IndexedDB for model storage
- ✅ **No Path Errors**: Completely browser-based, no file system issues
- ✅ **Active Development**: Backed by MLC AI and Apache TVM communities

## Technical Changes

### Dependencies
**Before:**
```json
"@xenova/transformers": "^2.17.2"
```

**After:**
```json
"@mlc-ai/web-llm": "^0.2.79"
```

### API Changes

**Before (Transformers.js):**
```typescript
import { pipeline, env } from '@xenova/transformers';

// Complex environment setup
env.allowLocalModels = false;
env.useFSCache = false;

// Initialize
const generator = await pipeline('text-generation', modelName);

// Generate
const result = await generator(prompt, { max_new_tokens: 100 });
```

**After (WebLLM):**
```typescript
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Simple initialization with progress tracking
const engine = await CreateMLCEngine(
  modelName,
  { initProgressCallback }
);

// Generate with OpenAI-compatible API
const completion = await engine.chat.completions.create({
  messages: chatHistory,
  max_tokens: 150
});
```

### Model Changes

**Before:**
- Xenova/Phi-1_5 (1.4GB)
- Xenova/TinyLlama-1.1B-Chat-v1.0 (1.1GB)
- Xenova/LaMini-Flan-T5-783M (783MB)

**After:**
- Llama-3.2-1B-Instruct-q4f16_1-MLC (~500MB) - Default
- Llama-3.2-3B-Instruct-q4f16_1-MLC (~1.5GB)
- Phi-3.5-mini-instruct-q4f16_1-MLC (~2GB)
- Qwen2.5-0.5B-Instruct-q4f16_1-MLC (~300MB)

## System Requirements

### New Requirements
- **WebGPU Support**: Chrome/Edge 113+ required
- **GPU**: Modern GPU (NVIDIA, AMD, or integrated)
- **Browser Cache**: 1-4GB for model storage

### No Longer Required
- ❌ Node.js file system access
- ❌ Complex environment detection
- ❌ Manual cache path configuration

## User-Facing Changes

### Improvements
1. **Faster Inference**: GPU acceleration makes responses 5-10x faster
2. **Better Progress**: Real-time download/loading progress in the UI
3. **Newer Models**: Access to state-of-the-art Llama 3.2 models
4. **More Reliable**: No file system errors, works consistently in Electron
5. **Smaller Models**: Qwen 0.5B is only ~300MB vs 783MB minimum before

### Trade-offs
1. **WebGPU Required**: Won't work on older browsers or systems without GPU
2. **Browser Cache**: Models stored in browser cache instead of file system
3. **Desktop Focus**: Best on desktop (mobile WebGPU support is limited)

## Migration Steps

If you were using the plugin with Transformers.js:

1. **Update Dependencies**
   ```bash
   npm uninstall @xenova/transformers
   npm install @mlc-ai/web-llm
   ```

2. **Rebuild Plugin**
   ```bash
   npm run build
   ```

3. **Reload in Obsidian**
   - Disable and re-enable the plugin
   - Or restart Obsidian

4. **First Load**
   - The new model will download (may take 2-10 minutes)
   - Old Transformers.js cache can be safely deleted if you want to free space

5. **Enjoy!**
   - Much faster performance
   - Better quality responses
   - More reliable operation

## Performance Comparison

### Transformers.js (Before)
- First load: 30-60 seconds
- Response time: 10-30 seconds per message
- Model size: 783MB - 1.4GB
- Runs on: CPU only
- Stability: Path errors in Electron

### WebLLM (After)
- First load: 2-10 minutes (one-time download)
- Response time: 2-10 seconds per message
- Model size: 300MB - 3GB (more options)
- Runs on: GPU (WebGPU)
- Stability: Fully compatible with Electron

## Future Plans

With WebLLM, we can now consider:
- [ ] Streaming responses (real-time text generation)
- [ ] Function calling for structured data extraction
- [ ] Larger models for better quality (Llama 3.2 7B+)
- [ ] Custom model fine-tuning
- [ ] Multi-turn conversation memory

## Questions?

Check the main [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md) for more information.

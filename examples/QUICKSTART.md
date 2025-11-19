# Quick Start: AI Canvas Workflows

## 🚀 5-Minute Tutorial

### Prerequisites
1. ✅ LM Studio is running
2. ✅ A model is loaded in LM Studio
3. ✅ Plugin settings configured with LM Studio URL (default: `http://localhost:1234/v1`)

### Step 1: Copy an Example Canvas

1. Copy one of these files to your vault:
   - `hello-world.canvas` ⭐ **Start here - the simplest!**
   - `example-ai-workflow.canvas`
   - `multi-agent-brainstorm.canvas`
   - `daily-note-enhancement.canvas`

2. Open it in Obsidian

### Step 2: Run Your First Workflow

Using `hello-world.canvas`:

1. **Look at the canvas** - you'll see:
   - 🟢 Green input node (agent description)
   - 🟣 Purple processing node (AI instructions)
   - 🟡 Yellow output node (results will appear here)
   - 🔵 Cyan instructions node

2. **Process the workflow:**
   - Press `Ctrl/Cmd + P` to open Command Palette
   - Type "Process AI"
   - Select "Process AI Node in Canvas"
   - Wait a few seconds...

3. **View the results:**
   - The yellow output node will update with AI-generated analysis!

That's it! You just ran your first AI workflow! 🎉

### Step 3: Customize It

1. **Edit the input (green node):**
   - Click the green node
   - Change the agent description
   - Try a different role or system prompt

2. **Edit the processing instructions (purple node):**
   - Click the purple node
   - Change what you want the AI to analyze
   - Examples:
     - "Summarize this in 3 bullet points"
     - "Translate this to English"
     - "Create 5 questions based on this"

3. **Run it again:**
   - Command Palette → "Process AI Node in Canvas"
   - See the updated results!

## 📚 Example Use Cases

### Use Case 1: Agent Analysis
**Canvas:** `example-ai-workflow.canvas`

**What it does:** Analyzes an agent's purpose and characteristics

**Try this:**
1. Replace the agent description with your own
2. Run the workflow
3. Get insights about your agent design

### Use Case 2: Multi-Perspective Brainstorm
**Canvas:** `multi-agent-brainstorm.canvas`

**What it does:** Combines insights from 3 different agent perspectives

**Try this:**
1. Modify the three agent perspectives (researcher, coach, psychologist)
2. Run the workflow
3. Get a synthesized approach combining all three

### Use Case 3: Daily Note Enhancement
**Canvas:** `daily-note-enhancement.canvas`

**What it does:** Creates reflections AND questions from a daily note

**Try this:**
1. Replace the daily note with your actual note
2. Run the workflow
3. Get personalized reflection AND follow-up questions

## 🎨 Creating Your Own Workflow

### Method 1: Copy and Modify
1. Copy an example canvas
2. Change the input content
3. Modify the processing instructions
4. Run!

### Method 2: Build from Scratch
1. Create a new canvas in Obsidian
2. Add input node (any text)
3. Add processing node with this format:
   ```
   # 🤖 My Processor

   **AI Processing Node**

   Your instructions here

   ---
   ```
4. Add output node (any text, will be replaced)
5. Connect: Input → Processing → Output
6. Run "Process AI Node in Canvas"

## 💡 Tips & Tricks

### Tip 1: Multiple Inputs
Connect multiple nodes TO one processing node to combine information:
```
[Input 1] ─┐
[Input 2] ─┼→ [Processing] → [Output]
[Input 3] ─┘
```

### Tip 2: Multiple Outputs
Connect one processing node TO multiple outputs for different views:
```
               ┌→ [Output 1]
[Input] → [Processing] ─┤
               └→ [Output 2]
```

### Tip 3: Chain Workflows
Use an output as input for another processor:
```
[Input] → [Process 1] → [Output 1] → [Process 2] → [Output 2]
```

### Tip 4: Parallel Processing
Process the same input in different ways:
```
               ┌→ [Process 1] → [Output 1]
[Input] ───────┤
               └→ [Process 2] → [Output 2]
```

## 🐛 Troubleshooting

### "No AI processing nodes found"
- Make sure your processing node contains `**AI Processing Node**`
- Check that it's a text node, not a file or link node

### "No input nodes connected"
- Draw an arrow FROM input TO processing node
- Make sure the arrow is pointing the right direction

### "AI processing failed"
- Check LM Studio is running
- Verify the URL in plugin settings
- Make sure a model is loaded in LM Studio
- Check the developer console (Ctrl/Cmd + Shift + I) for errors

### Results not updating
- Make sure you're looking at the output node (yellow)
- Try clicking away and back to refresh
- Check the console for errors

## 🎯 Next Steps

1. **Try all three examples** to see different patterns
2. **Create your own workflow** for your specific use case
3. **Experiment with instructions** to get different results
4. **Chain multiple steps** for complex processing
5. **Share your workflows** with others (canvas files are portable!)

## 🔗 More Information

- See [README.md](README.md) for detailed documentation
- Check the main plugin [README](../README.md) for full feature list
- Explore the example canvases for inspiration

Happy processing! 🚀

# Canvas AI Workflow Examples

This folder contains example canvas files demonstrating AI processing workflows.

## Quick Start

1. **Copy an example to your vault:**
   - Copy any `.canvas` file from this folder to your Obsidian vault
   - Open it in Obsidian

2. **Run the AI processing:**
   - Open Command Palette (`Ctrl/Cmd + P`)
   - Type "Process AI Node"
   - Select "Process AI Node in Canvas"
   - The AI will process the workflow and update output nodes

## Examples

### [hello-world.canvas](hello-world.canvas) ⭐ **START HERE**
**The simplest possible workflow**

Perfect for first-time users:
- 🟢 Input node → Simple test message
- 🟣 Processing node → Basic instructions
- 🟡 Output node → AI response

**Use case:** Learn the basics - your "hello world" for AI canvas workflows

### [example-ai-workflow.canvas](example-ai-workflow.canvas)
**Simple agent analysis workflow**

Shows the basic workflow pattern:
- Input node (green) → Contains agent description
- Processing node (purple) → Defines what to analyze
- Output node (yellow) → Receives AI results

**Use case:** Analyze an agent's purpose and characteristics

### [multi-agent-brainstorm.canvas](multi-agent-brainstorm.canvas)
**Multi-agent brainstorming workflow**

Shows how multiple agents can contribute to a task:
- Multiple input nodes with different perspectives
- Single processing node that synthesizes all inputs
- Output node with combined insights

**Use case:** Combine insights from multiple specialized agents

## Creating Your Own Workflows

### Basic Pattern

```
[Input Node] → [AI Processing Node] → [Output Node]
```

### Node Types

1. **Input Nodes (Any text node)**
   - Contains the data to process
   - Can be agent descriptions, notes, questions, etc.
   - Connect TO the processing node

2. **AI Processing Nodes (Purple)**
   - Must contain `**AI Processing Node**` in the text
   - Defines what to do with inputs
   - Format:
     ```
     # 🤖 [Name]

     **AI Processing Node**

     [Your instructions here]

     ---

     *Connect input nodes to this node, then connect this node to output nodes*
     ```

3. **Output Nodes (Yellow)**
   - Receives AI-processed results
   - Will be automatically updated when processing runs
   - Connect FROM the processing node

### Example Instructions for Processing Nodes

**Analysis:**
```
Analyze the input and provide:
1. Main themes
2. Key insights
3. Recommendations
```

**Synthesis:**
```
Combine all inputs into a coherent summary.
Focus on common themes and unique perspectives.
```

**Translation:**
```
Translate the input from Romanian to English.
Maintain the tone and style.
```

**Enhancement:**
```
Take this agent description and:
1. Make it more specific
2. Add examples
3. Improve clarity
```

## Tips

- **Multiple Inputs:** You can connect multiple input nodes to one processing node
- **Multiple Outputs:** You can connect one processing node to multiple output nodes
- **Chain Workflows:** Connect an output node as input to another processing node
- **Edit Instructions:** Modify the processing node instructions to change behavior
- **Reprocess:** Run the command again after editing to see new results

## Requirements

- LM Studio must be running
- Configure the LM Studio URL in plugin settings
- A language model must be loaded in LM Studio

import { TFile } from 'obsidian';
import { CanvasService } from './CanvasService';
import { AIService } from './AIService';
import { JSONCanvasTextNode, JSONCanvasNode } from '../types/jsoncanvas';

/**
 * Service for processing AI nodes in canvas workflows
 */
export class AIProcessingService {
	constructor(
		private canvasService: CanvasService,
		private aiService: AIService
	) {}

	/**
	 * Processes an AI node by taking its inputs, running them through AI, and updating outputs
	 */
	async processAINode(file: TFile, processingNodeId: string): Promise<void> {
		// Get the processing node content to understand what to do
		const processingNodeContent = await this.canvasService.getNodeContent(file, processingNodeId);

		if (!processingNodeContent) {
			throw new Error(`Processing node ${processingNodeId} not found`);
		}

		// Get input nodes
		const inputNodes = await this.canvasService.getInputNodes(file, processingNodeId);

		if (inputNodes.length === 0) {
			throw new Error(`No input nodes connected to ${processingNodeId}`);
		}

		// Get output nodes
		const outputNodes = await this.canvasService.getOutputNodes(file, processingNodeId);

		if (outputNodes.length === 0) {
			throw new Error(`No output nodes connected to ${processingNodeId}`);
		}

		// Collect input content
		const inputContents = inputNodes
			.filter(node => node.type === 'text')
			.map(node => (node as JSONCanvasTextNode).text)
			.join('\n\n---\n\n');

		// Extract instruction from processing node
		const instruction = this.extractInstruction(processingNodeContent);

		// Build prompt for AI
		const prompt = this.buildPrompt(instruction, inputContents);

		// Process with AI
		const result = await this.processWithAI(prompt);

		// Update all output nodes with the result
		for (const outputNode of outputNodes) {
			const outputContent = `# ${this.getNodeTitle(outputNode)}\n\n${result}`;
			await this.canvasService.updateOutputNode(file, outputNode.id, outputContent);
		}
	}

	/**
	 * Extracts the instruction from a processing node's content
	 */
	private extractInstruction(content: string): string {
		// Look for content between the title and the separator
		const lines = content.split('\n');
		const instructionLines: string[] = [];
		let capturing = false;

		for (const line of lines) {
			if (line.includes('**AI Processing Node**')) {
				capturing = true;
				continue;
			}

			if (line.includes('---')) {
				break;
			}

			if (capturing && line.trim()) {
				instructionLines.push(line.trim());
			}
		}

		return instructionLines.join('\n') || 'Process the input and provide insights.';
	}

	/**
	 * Gets the title from a node's content
	 */
	private getNodeTitle(node: JSONCanvasNode): string {
		if (node.type !== 'text') {
			return 'Output';
		}
		const textNode = node as JSONCanvasTextNode;
		const firstLine = textNode.text.split('\n')[0];
		return firstLine.replace(/^#\s*/, '').trim();
	}

	/**
	 * Builds the prompt for AI processing
	 */
	private buildPrompt(instruction: string, inputContent: string): string {
		return `${instruction}\n\nINPUT:\n${inputContent}\n\nOUTPUT:`;
	}

	/**
	 * Processes content with AI
	 */
	private async processWithAI(prompt: string): Promise<string> {
		try {
			const messages = [
				{
					role: 'system' as const,
					content: 'You are a helpful AI assistant that processes information according to instructions.'
				},
				{
					role: 'user' as const,
					content: prompt
				}
			];

			const response = await this.aiService.callLMStudio(messages);
			return response;
		} catch (error) {
			console.error('Error processing with AI:', error);
			throw new Error(`AI processing failed: ${error}`);
		}
	}

	/**
	 * Creates a complete AI processing workflow:
	 * Input node -> Processing node -> Output node
	 */
	async createProcessingWorkflow(
		file: TFile,
		inputNodeId: string,
		instruction: string,
		workflowName: string
	): Promise<void> {
		const processingNodeId = `ai-processor-${Date.now()}`;
		const outputNodeId = `ai-output-${Date.now()}`;

		// Get the input node to position others relative to it
		const data = await this.canvasService.readCanvas(file);
		const inputNode = data.nodes?.find(n => n.id === inputNodeId);

		if (!inputNode) {
			throw new Error(`Input node ${inputNodeId} not found`);
		}

		// Add processing node to the right of input
		await this.canvasService.addAIProcessingNode(
			file,
			processingNodeId,
			workflowName,
			instruction,
			{ x: inputNode.x + inputNode.width + 50, y: inputNode.y }
		);

		// Add output node to the right of processing node
		await this.canvasService.addOutputNode(
			file,
			outputNodeId,
			`${workflowName} - Result`,
			{ x: inputNode.x + inputNode.width * 2 + 100, y: inputNode.y }
		);

		// Connect input -> processing
		await this.canvasService.addConnection(file, inputNodeId, processingNodeId);

		// Connect processing -> output
		await this.canvasService.addConnection(file, processingNodeId, outputNodeId);
	}
}

/**
 * Base Patcher class for monkey-patching Obsidian internals
 * Uses the monkey-around library for safe method wrapping
 */

import { around } from 'monkey-around';
import type DailyAIAssistantPlugin from '../main';

export abstract class Patcher {
	protected plugin: DailyAIAssistantPlugin;

	constructor(plugin: DailyAIAssistantPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Apply patches when the plugin loads
	 */
	abstract patch(): void;

	/**
	 * Patch methods on a prototype
	 */
	protected patchPrototype<T extends object>(prototype: T, patches: unknown): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.plugin.register(around(prototype, patches as any));
	}

	/**
	 * Patch methods on both an instance and its prototype
	 */
	protected patchThisAndPrototype<T extends object>(instance: T, patches: unknown): void {
		this.patchPrototype(instance, patches);

		const prototype = Object.getPrototypeOf(instance);
		if (prototype) {
			this.patchPrototype(prototype, patches);
		}
	}

	/**
	 * Wait for a specific view type to be available, then patch it
	 */
	protected tryPatchWorkspaceView(
		viewType: string,
		callback: (view: unknown) => void
	): void {
		const view = this.plugin.app.workspace.getLeavesOfType(viewType)[0]?.view;

		if (view) {
			callback(view);
		} else {
			// Wait for the view to be created
			const eventRef = this.plugin.app.workspace.on('layout-change', () => {
				const newView = this.plugin.app.workspace.getLeavesOfType(viewType)[0]?.view;
				if (newView) {
					this.plugin.app.workspace.offref(eventRef);
					callback(newView);
				}
			});

			this.plugin.registerEvent(eventRef);
		}
	}

	/**
	 * Run callback after target is initialized
	 */
	protected runAfterInitialized(target: { initialized?: boolean }, callback: () => void): void {
		if (target.initialized) {
			callback();
		} else {
			setTimeout(() => callback(), 0);
		}
	}
}

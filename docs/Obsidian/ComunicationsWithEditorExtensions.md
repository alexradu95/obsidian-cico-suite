Communicating with editor extensions
Once you've built your editor extension, you might want to communicate with it from outside the editor. For example, through a command, or a ribbon action.

You can access the CodeMirror 6 editor from a MarkdownView. However, since the Obsidian API doesn't actually expose the editor, you need to tell TypeScript to trust that it's there, using @ts-expect-error.

import { EditorView } from '@codemirror/view';

// @ts-expect-error, not typed
const editorView = view.editor.cm as EditorView;
View plugin 
You can access the view plugin instance from the EditorView.plugin() method.

this.addCommand({
	id: 'example-editor-command',
	name: 'Example editor command',
	editorCallback: (editor, view) => {
		// @ts-expect-error, not typed
		const editorView = view.editor.cm as EditorView;

		const plugin = editorView.plugin(examplePlugin);

		if (plugin) {
			plugin.addPointerToSelection(editorView);
		}
	},
});
State field 
You can dispatch changes and dispatch state effects directly on the editor view.

this.addCommand({
	id: 'example-editor-command',
	name: 'Example editor command',
	editorCallback: (editor, view) => {
		// @ts-expect-error, not typed
		const editorView = view.editor.cm as EditorView;

		editorView.dispatch({
			effects: [
				// ...
			],
		});
	},
});
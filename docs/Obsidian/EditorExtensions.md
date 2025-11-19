Editor extensions let you customize the experience of editing notes in Obsidian. This page explains what editor extensions are, and when to use them.

Obsidian uses CodeMirror 6 (CM6) to power the Markdown editor. Just like Obsidian, CM6 has plugins of its own, called extensions. In other words, an Obsidian editor extension is the same thing as a CodeMirror 6 extension.

The API for building editor extensions is a bit unconventional and requires that you have a basic understanding of its architecture before you get started. This section aims to give you enough context and examples for you to get started. If you want to learn more about building editor extensions, refer to the CodeMirror 6 documentation.

Do I need an editor extension? 
Building editor extensions can be challenging, so before you start building one, consider whether you really need it.

If you want to change how to convert Markdown to HTML in the Reading view, consider building a Markdown post processor.
If you want to change how the document looks and feels in Live Preview, you need to build an editor extension.
Registering editor extensions 
CodeMirror 6 (CM6) is a powerful engine for editing code using web technologies. At its core, the editor itself has a minimal set of features. Any features you'd expect from a modern editor are available as extensions that you can pick and choose. While Obsidian comes with many of these extensions out-of-the-box, you can also register your own.

To register an editor extension, use registerEditorExtension() in the onload method of your Obsidian plugin:

onload() {
  this.registerEditorExtension([examplePlugin, exampleField]);
}
While CM6 supports several types of extensions, two of the most common ones are View plugins and State fields.

Links to this page
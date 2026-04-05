# WYSIWYG Markdown for VS Code

A modern, powerful, and graphical Markdown editor for Visual Studio Code, powered by [Vditor](https://github.com/Vanessa219/vditor).

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/masaya.wysiwyg-markdown.svg?label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=masaya.wysiwyg-markdown)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/masaya.wysiwyg-markdown.svg)](https://marketplace.visualstudio.com/items?itemName=masaya.wysiwyg-markdown)

## Features

- **Graphical Editing**: Full WYSIWYG (What You See Is What You Get) experience. Edit your Markdown visually without needing to know the syntax.
- **Bi-directional Sync**: Edits made in the WYSIWYG pane are instantly synced to the text document, and vice versa.
- **Theme Adaptation**: Automatically matches your VS Code theme (Light/Dark).
- **Web Support**: Fully compatible with VS Code for the Web (`vscode.dev`, `github.dev`).
- **Rich Markdown Support**: Powered by Vditor, supporting tables, math formulas (KaTeX), diagrams (Mermaid), and more.

## Usage

1. Open any Markdown file (`.md`).
2. Right-click the file tab or the file in the Explorer sidebar.
3. Select **"Open With..."**.
4. Choose **"Vditor Markdown Editor"**.

## Development

This extension is built with **TypeScript** and **esbuild**.

### Getting Started

1. Clone the repository.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Compile the extension:

   ```bash
   bun run compile-web
   ```

4. Run tests:

   ```bash
   bun run test
   ```

### Debugging

- Press `F5` in VS Code to start a new Extension Development Host window.
- Or run `bun run run-in-browser` to test in a browser-based environment.

## Extension Settings

This extension currently does not contribute any settings.

## Known Issues

- Large files might experience a slight delay during initial synchronization.

## License

[MIT](LICENSE)

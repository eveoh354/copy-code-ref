# Copy Code Reference

Copy AI-friendly file references from selections or multiple cursors:

```text
/path/to/project/src/example.ts#L137-181
```

This is useful when sending exact code locations to Codex, Claude Code, Cursor Chat, or other AI coding tools.

## Usage

1. Select code in VS Code, Cursor, Trae, or another VS Code-compatible editor.
2. Press the default shortcut:
   - macOS: `Cmd+Option+C`
   - Windows/Linux: `Ctrl+Alt+C`
3. Paste the copied reference anywhere.

If there is no selection, the extension copies the current line, for example:

```text
/path/to/project/src/example.ts#L137
```

Multiple cursors or selections are copied as one reference per line:

```text
/path/to/project/src/example.ts#L137
/path/to/project/src/example.ts#L181-190
/path/to/project/src/example.ts#L224
```

You can also run `Copy Code: Copy Code Reference` from the Command Palette or the editor context menu.

## Why For AI

AI coding tools work best when you give them precise file and line references. This extension copies only the location reference, not the code content, so it stays compact and avoids accidentally pasting large or sensitive snippets into chat.

## Customize The Shortcut

Open Keyboard Shortcuts and search for:

```text
Copy Code Reference
```

Then bind it to any shortcut that does not conflict in your editor.

## Install Locally

Install dependencies once:

```bash
npm install
```

Package a `.vsix`:

```bash
npm run package
```

Install the generated `.vsix` in VS Code-compatible editors:

```bash
code --install-extension copy-code-ref-0.0.2.vsix
```

For Cursor or Trae, use their extension install UI or CLI if available.

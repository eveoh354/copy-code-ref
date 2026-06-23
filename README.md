# Copy Code Path Reference

English | [中文](#中文)

Copy AI-friendly file and line references from VS Code-compatible editors:

```text
/path/to/project/src/example.ts#L137-181
```

This is useful when sending exact code locations to Codex, Claude Code, Cursor Chat, or other AI coding tools.

## Quick Usage

Select code, press the shortcut, then paste the copied reference into your AI coding tool.

| Platform | Shortcut |
| --- | --- |
| macOS | `Cmd+Option+C` |
| Windows/Linux | `Ctrl+Alt+C` |

To open your configured AI coding tool with the reference, use:

| Platform | Shortcut |
| --- | --- |
| macOS | `Cmd+Option+N` |
| Windows/Linux | `Ctrl+Alt+N` |

Run `Copy Code: Select AI Coding Tool` from the Command Palette to choose the target for `Cmd+Option+N`:

| Value | Tool | Behavior |
| --- | --- | --- |
| `codex` | Codex | Opens a new Codex thread with `codex://new?prompt=...&path=...`. |
| `claudeCode` | Claude Code | Opens a new Claude Code session with `claude-cli://open?q=...&cwd=...`. |

Both options prefill the prompt but do not send it automatically.

If Claude Code is running in the VS Code-compatible integrated terminal, send the reference to the active terminal:

| Platform | Shortcut |
| --- | --- |
| macOS | `Cmd+Option+Z` |
| Windows/Linux | `Ctrl+Alt+Z` |

This writes the reference into the active terminal input without pressing Enter.

Output example:

```text
/path/to/project/src/example.ts#L137-181
```

No selection copies the current line:

```text
/path/to/project/src/example.ts#L137
```

Multiple cursors or selections are copied as one reference per line:

```text
/path/to/project/src/example.ts#L137
/path/to/project/src/example.ts#L181-190
/path/to/project/src/example.ts#L224
```

## Other Ways To Run

These are VS Code commands contributed by this extension. You can run them from the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux) or from the editor context menu in VS Code, Cursor, Trae, or another VS Code-compatible editor:

| Command | What It Does |
| --- | --- |
| `Copy Code: Copy Code Path Reference` | Copies the selected file and line reference to the clipboard. |
| `Copy Code: Open AI Coding Tool with Code Path Reference` | Opens the configured AI coding tool, currently Codex or Claude Code, with the reference prefilled. |
| `Copy Code: Send Code Path Reference to Active Terminal` | Sends the reference to Claude Code or another CLI running in the integrated terminal. |
| `Copy Code: Select AI Coding Tool` | Lets you choose Codex or Claude Code for the `Cmd+Option+N` / `Ctrl+Alt+N` command. |

You can also change the same target from Settings by editing `copyCodePathRef.aiCodingTool`.

## Why For AI

AI coding tools work best when you give them precise file and line references. This extension copies only the location reference, not the code content, so it stays compact and avoids accidentally pasting large or sensitive snippets into chat.

## Customize The Shortcut

Open Keyboard Shortcuts and search for:

```text
Copy Code Path Reference
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
code --install-extension copy-code-path-ref-0.1.0.vsix
```

For Cursor or Trae, use their extension install UI or CLI if available.

## 中文

从 VS Code 兼容编辑器里复制适合 AI 编程工具使用的文件路径和行号引用：

```text
/path/to/project/src/example.ts#L137-181
```

当你需要把精确的代码位置发给 Codex、Claude Code、Cursor Chat 或其他 AI 编程工具时，这个扩展会很方便。

## 快速使用

选中代码，按快捷键，然后把复制出来的引用粘贴到 AI 编程工具里。

| 平台 | 快捷键 |
| --- | --- |
| macOS | `Cmd+Option+C` |
| Windows/Linux | `Ctrl+Alt+C` |

可以用下面的快捷键打开配置里选择的 AI coding 工具，并把引用作为 prompt 带过去：

| 平台 | 快捷键 |
| --- | --- |
| macOS | `Cmd+Option+N` |
| Windows/Linux | `Ctrl+Alt+N` |

在命令面板运行 `Copy Code: Select AI Coding Tool`，可以选择 `Cmd+Option+N` 要打开的目标工具：

| 值 | 工具 | 行为 |
| --- | --- | --- |
| `codex` | Codex | 使用 `codex://new?prompt=...&path=...` 打开新的 Codex thread。 |
| `claudeCode` | Claude Code | 使用 `claude-cli://open?q=...&cwd=...` 打开新的 Claude Code session。 |

这两种方式都会预填 prompt，但不会自动发送。

如果 Claude Code 跑在 VS Code 兼容编辑器的内置终端里，可以把引用发送到当前终端：

| 平台 | 快捷键 |
| --- | --- |
| macOS | `Cmd+Option+Z` |
| Windows/Linux | `Ctrl+Alt+Z` |

它会把引用写进当前终端输入行，但不会自动按 Enter。

输出示例：

```text
/path/to/project/src/example.ts#L137-181
```

没有选中代码时，会复制当前行：

```text
/path/to/project/src/example.ts#L137
```

多个光标或多个选区会复制为多行，每行一个引用：

```text
/path/to/project/src/example.ts#L137
/path/to/project/src/example.ts#L181-190
/path/to/project/src/example.ts#L224
```

## 其他运行方式

这些是这个扩展注册到 VS Code 里的命令。你可以在 VS Code、Cursor、Trae 或其他兼容 VS Code 扩展的编辑器里，通过命令面板运行它们：macOS 按 `Cmd+Shift+P`，Windows/Linux 按 `Ctrl+Shift+P`，然后搜索 `Copy Code`。也可以在编辑器右键菜单里运行。

| 命令 | 作用 |
| --- | --- |
| `Copy Code: Copy Code Path Reference` | 把选区的文件路径和行号引用复制到剪贴板。 |
| `Copy Code: Open AI Coding Tool with Code Path Reference` | 打开配置里选择的 AI coding 工具，目前支持 Codex 和 Claude Code，并预填引用。 |
| `Copy Code: Send Code Path Reference to Active Terminal` | 把引用发送到内置终端里的 Claude Code 或其他 CLI。 |
| `Copy Code: Select AI Coding Tool` | 选择 `Cmd+Option+N` / `Ctrl+Alt+N` 要打开 Codex 还是 Claude Code。 |

同一个目标也可以在 Settings 里通过 `copyCodePathRef.aiCodingTool` 修改。

## 为什么适合 AI

AI 编程工具在拿到精确的文件路径和行号后，更容易定位上下文。这个扩展只复制位置引用，不复制代码内容，所以粘贴结果更紧凑，也能减少误把大段代码或敏感代码贴进聊天窗口的风险。

## 自定义快捷键

打开 Keyboard Shortcuts，搜索：

```text
Copy Code Path Reference
```

然后绑定成你喜欢、且不和其他功能冲突的快捷键。

## 本地安装

首次安装依赖：

```bash
npm install
```

打包 `.vsix`：

```bash
npm run package
```

在兼容 VS Code 扩展的编辑器里安装生成的 `.vsix`：

```bash
code --install-extension copy-code-path-ref-0.1.0.vsix
```

Cursor 或 Trae 可以使用它们的扩展安装界面，或者使用对应 CLI 安装。

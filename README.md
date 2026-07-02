# Copy Code Ref for AI

[![GitHub Repository](https://img.shields.io/badge/GitHub-copy--code--ref-24292f?logo=github)](https://github.com/eveoh354/copy-code-ref)
[![Version](https://img.shields.io/badge/version-0.1.4-blue)](https://github.com/eveoh354/copy-code-ref)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

English | [中文](#中文)

A VS Code extension that copies selected code locations as file:line references and opens OpenAI Codex or Claude Code with the prompt prefilled.

Copy AI-friendly file and line references from VS Code-compatible editors:

```text
/path/to/project/src/example.ts#L137-181
```

This is useful when sending exact code locations to OpenAI Codex, Claude Code, Cursor Chat, Trae, or other AI coding tools without pasting the full code content.

## Quick Usage

Select code, press the shortcut, then paste the copied reference into your AI coding tool.

| Platform | Shortcut |
| --- | --- |
| macOS | **⌘ ⌥ C** (`Cmd+Option+C`) |
| Windows/Linux | `Ctrl+Alt+C` |

To open your configured AI coding tool with the reference, use:

| Platform | Shortcut |
| --- | --- |
| macOS | **⌘ ⌥ N** (`Cmd+Option+N`) |
| Windows/Linux | `Ctrl+Alt+N` |

Run `Copy Code: Select AI Coding Tool` from the Command Palette to choose the target for **⌘ ⌥ N** (`Cmd+Option+N`):

| Value | Tool | Behavior |
| --- | --- | --- |
| `codex` | Codex | Opens a new Codex thread with `codex://new?prompt=...&path=...`. |
| `claudeCode` | Claude Code | Opens a new Claude Code session with `claude-cli://open?q=...&cwd=...`. |

Both options prefill the prompt but do not send it automatically.

If Claude Code is running in the VS Code-compatible integrated terminal, send the reference to the active terminal:

| Platform | Shortcut |
| --- | --- |
| macOS | **⌘ ⌥ Z** (`Cmd+Option+Z`) |
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

These are VS Code commands contributed by this extension. You can run them from the Command Palette (**⌘ ⇧ P** / `Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux) or from the editor context menu in VS Code, Cursor, Trae, or another VS Code-compatible editor:

After selecting code, you can also right-click in the editor and choose one of the Copy Code commands. The same menu includes `Copy Code: Select AI Coding Tool`, so you can switch the configured target between Codex and Claude Code without opening Settings.

| Command | What It Does |
| --- | --- |
| `Copy Code: Copy Code Path Reference` | Copies the selected file and line reference to the clipboard. |
| `Copy Code: Open AI Coding Tool with Code Path Reference` | Opens the configured AI coding tool, currently Codex or Claude Code, with the reference prefilled. |
| `Copy Code: Send Code Path Reference to Active Terminal` | Sends the reference to Claude Code or another CLI running in the integrated terminal. |
| `Copy Code: Select AI Coding Tool` | Lets you choose Codex or Claude Code for the **⌘ ⌥ N** (`Cmd+Option+N`) / `Ctrl+Alt+N` command. |

You can also change the same target from Settings by editing `copyCodePathRef.aiCodingTool`.

## Why For AI

AI coding tools work best when you give them precise file and line references. This extension copies only the location reference, not the code content, so it stays compact and avoids accidentally pasting large or sensitive snippets into chat.

## Customize The Shortcut

Open Keyboard Shortcuts and search for:

```text
Copy Code Path Reference
```

Then bind it to any shortcut that does not conflict in your editor.

## Install

Search for `Copy Code Ref for AI`, `copy-code-path-ref`, or `ohEVE.copy-code-path-ref` in the VS Code Marketplace, then install the extension from your editor.

If it does not appear in your VS Code-compatible editor, open the extension page in the VS Code Marketplace and install it from there.

If you have a `.vsix` package, you can also install it manually:

```bash
code --install-extension copy-code-path-ref-0.1.4.vsix
```

For Cursor or Trae, use their extension marketplace, extension install UI, or CLI if available.

## 中文

一个 VS Code 扩展，用来把选中的代码位置复制成 file:line 引用，并打开 OpenAI Codex 或 Claude Code 预填 prompt。

从 VS Code 兼容编辑器里复制适合 AI 编程工具使用的文件路径和行号引用：

```text
/path/to/project/src/example.ts#L137-181
```

当你需要把精确的代码位置发给 OpenAI Codex、Claude Code、Cursor Chat、Trae 或其他 AI 编程工具，又不想粘贴完整代码内容时，这个扩展会很方便。

## 快速使用

选中代码，按快捷键，然后把复制出来的引用粘贴到 AI 编程工具里。

| 平台 | 快捷键 |
| --- | --- |
| macOS | **⌘ ⌥ C** (`Cmd+Option+C`) |
| Windows/Linux | `Ctrl+Alt+C` |

可以用下面的快捷键打开配置里选择的 AI coding 工具，并把引用作为 prompt 带过去：

| 平台 | 快捷键 |
| --- | --- |
| macOS | **⌘ ⌥ N** (`Cmd+Option+N`) |
| Windows/Linux | `Ctrl+Alt+N` |

在命令面板运行 `Copy Code: Select AI Coding Tool`，可以选择 **⌘ ⌥ N** (`Cmd+Option+N`) 要打开的目标工具：

| 值 | 工具 | 行为 |
| --- | --- | --- |
| `codex` | Codex | 使用 `codex://new?prompt=...&path=...` 打开新的 Codex thread。 |
| `claudeCode` | Claude Code | 使用 `claude-cli://open?q=...&cwd=...` 打开新的 Claude Code session。 |

这两种方式都会预填 prompt，但不会自动发送。

如果 Claude Code 跑在 VS Code 兼容编辑器的内置终端里，可以把引用发送到当前终端：

| 平台 | 快捷键 |
| --- | --- |
| macOS | **⌘ ⌥ Z** (`Cmd+Option+Z`) |
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

这些是这个扩展注册到 VS Code 里的命令。你可以在 VS Code、Cursor、Trae 或其他兼容 VS Code 扩展的编辑器里，通过命令面板运行它们：macOS 按 **⌘ ⇧ P** (`Cmd+Shift+P`)，Windows/Linux 按 `Ctrl+Shift+P`，然后搜索 `Copy Code`。也可以在编辑器右键菜单里运行。

选中代码后，也可以直接在编辑器里右键，选择对应的 Copy Code 命令。同一个右键菜单里也有 `Copy Code: Select AI Coding Tool`，可以不用打开 Settings，就把目标工具在 Codex 和 Claude Code 之间切换。

| 命令 | 作用 |
| --- | --- |
| `Copy Code: Copy Code Path Reference` | 把选区的文件路径和行号引用复制到剪贴板。 |
| `Copy Code: Open AI Coding Tool with Code Path Reference` | 打开配置里选择的 AI coding 工具，目前支持 Codex 和 Claude Code，并预填引用。 |
| `Copy Code: Send Code Path Reference to Active Terminal` | 把引用发送到内置终端里的 Claude Code 或其他 CLI。 |
| `Copy Code: Select AI Coding Tool` | 选择 **⌘ ⌥ N** (`Cmd+Option+N`) / `Ctrl+Alt+N` 要打开 Codex 还是 Claude Code。 |

同一个目标也可以在 Settings 里通过 `copyCodePathRef.aiCodingTool` 修改。

## 为什么适合 AI

AI 编程工具在拿到精确的文件路径和行号后，更容易定位上下文。这个扩展只复制位置引用，不复制代码内容，所以粘贴结果更紧凑，也能减少误把大段代码或敏感代码贴进聊天窗口的风险。

## 自定义快捷键

打开 Keyboard Shortcuts，搜索：

```text
Copy Code Path Reference
```

然后绑定成你喜欢、且不和其他功能冲突的快捷键。

## 安装

在 VS Code Marketplace 里搜索 `Copy Code Ref for AI`、`copy-code-path-ref` 或 `ohEVE.copy-code-path-ref`，然后从编辑器里安装这个扩展。

如果你的 VS Code 兼容编辑器里搜不到，可以打开 VS Code Marketplace 的扩展页面，从网页安装。

如果你已经有 `.vsix` 包，也可以手动安装：

```bash
code --install-extension copy-code-path-ref-0.1.4.vsix
```

Cursor 或 Trae 可以优先使用它们自己的扩展市场、扩展安装界面，或者对应 CLI。

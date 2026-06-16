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

You can also run `Copy Code: Copy Code Path Reference` from the Command Palette or the editor context menu in VS Code, Cursor, Trae, or another VS Code-compatible editor.

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
code --install-extension copy-code-path-ref-0.0.1.vsix
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

你也可以在 VS Code、Cursor、Trae 或其他兼容 VS Code 扩展的编辑器里，从命令面板或编辑器右键菜单运行 `Copy Code: Copy Code Path Reference`。

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
code --install-extension copy-code-path-ref-0.0.1.vsix
```

Cursor 或 Trae 可以使用它们的扩展安装界面，或者使用对应 CLI 安装。

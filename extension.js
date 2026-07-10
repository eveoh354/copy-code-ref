const vscode = require('vscode');
const { execFile } = require('child_process');

const USAGE_STATS_KEY = 'copyCodePathRef.usageStats';
const USAGE_COMMANDS = [
  {
    id: 'copyReference',
    title: 'Copy Code Path Reference',
    shortcut: process.platform === 'darwin' ? 'Cmd+Option+C' : 'Ctrl+Alt+C'
  },
  {
    id: 'openAiCodingToolWithReference',
    title: 'Open AI Coding Tool with Code Path Reference',
    shortcut: process.platform === 'darwin' ? 'Cmd+Option+N' : 'Ctrl+Alt+N'
  },
  {
    id: 'sendReferenceToActiveTerminal',
    title: 'Send Code Path Reference to Active Terminal',
    shortcut: process.platform === 'darwin' ? 'Cmd+Option+Z' : 'Ctrl+Alt+Z'
  }
];

function getLineRange(selection) {
  const startLine = selection.start.line + 1;
  let endLine = selection.end.line + 1;

  if (!selection.isEmpty && selection.end.character === 0 && selection.end.line > selection.start.line) {
    endLine -= 1;
  }

  return { startLine, endLine };
}

function formatClaudeCodeReference(filePath, startLine, endLine) {
  if (startLine === endLine) {
    return `@${filePath}#${startLine}`;
  }

  return `@${filePath}#${startLine}-${endLine}`;
}

function escapeMarkdownLinkLabel(label) {
  return label.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function formatMarkdownLinkDestination(destination) {
  if (/[\s()<>]/.test(destination)) {
    return `<${destination.replace(/>/g, '%3E')}>`;
  }

  return destination;
}

function formatCodexReference(filePath, startLine, endLine) {
  const target = `${filePath}:${startLine}`;
  const label = startLine === endLine ? target : `${filePath}:${startLine}-${endLine}`;
  return `[${escapeMarkdownLinkLabel(label)}](${formatMarkdownLinkDestination(target)})`;
}

function formatReference(filePath, startLine, endLine, targetTool = 'claudeCode') {
  if (targetTool === 'codex') {
    return formatCodexReference(filePath, startLine, endLine);
  }

  return formatClaudeCodeReference(filePath, startLine, endLine);
}

function getReferences(filePath, selections, targetTool = 'claudeCode') {
  return selections.map((selection) => {
    const { startLine, endLine } = getLineRange(selection);
    return formatReference(filePath, startLine, endLine, targetTool);
  });
}

function parseJsonQuery(query) {
  if (!query) {
    return undefined;
  }

  const candidates = [query];

  try {
    candidates.push(decodeURIComponent(query));
  } catch {
    // Keep the raw query candidate when decoding is not possible.
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next representation.
    }
  }

  return undefined;
}

function getDocumentFilePath(uri) {
  if (uri.scheme === 'file') {
    return uri.fsPath;
  }

  if (uri.scheme === 'git') {
    const query = parseJsonQuery(uri.query);

    if (query && typeof query.path === 'string') {
      return query.path;
    }
  }

  return undefined;
}

async function copyReference() {
  const referenceText = await copyReferenceToClipboard();

  if (!referenceText) {
    return;
  }

  await recordUsage('copyReference');

  const references = referenceText.split('\n');
  vscode.window.setStatusBarMessage(`Copied ${references.length} code reference${references.length === 1 ? '' : 's'}`, 2500);
}

async function copyReferenceToClipboard(targetTool = getAiCodingTool()) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage('Open a file before copying a codeblock reference.');
    return undefined;
  }

  const filePath = getDocumentFilePath(editor.document.uri);

  if (!filePath) {
    vscode.window.showWarningMessage('Codeblock references can only be copied from local files or Git changes.');
    return undefined;
  }

  const references = getReferences(filePath, editor.selections, targetTool);
  const referenceText = references.join('\n');

  await vscode.env.clipboard.writeText(referenceText);
  return referenceText;
}

function openUrl(url) {
  if (process.platform !== 'darwin') {
    return vscode.env.openExternal(vscode.Uri.parse(url, true));
  }

  return new Promise((resolve, reject) => {
    execFile('open', [url], (error, stdout, stderr) => {
      if (error) {
        error.message = stderr.trim() || error.message;
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

function getWorkspacePath(editor) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

  if (workspaceFolder && workspaceFolder.uri.scheme === 'file') {
    return workspaceFolder.uri.fsPath;
  }

  const documentPath = getDocumentFilePath(editor.document.uri);
  return documentPath;
}

function getAiCodingTool() {
  const config = vscode.workspace.getConfiguration('copyCodePathRef');
  return config.get('aiCodingTool', 'codex');
}

function getAiCodingToolLabel(tool) {
  if (tool === 'claudeCode') {
    return 'Claude Code';
  }

  return 'Codex';
}

function getAiCodingToolItems() {
  return [
    {
      label: 'Codex',
      description: 'codex://new',
      detail: 'Open a new Codex thread with the selected file reference.',
      value: 'codex'
    },
    {
      label: 'Claude Code',
      description: 'claude-cli://open',
      detail: 'Open a new Claude Code session with the selected file reference.',
      value: 'claudeCode'
    }
  ];
}

function buildAiCodingToolUrl(tool, referenceText, workspacePath) {
  if (tool === 'claudeCode') {
    const url = new URL('claude-cli://open');
    url.searchParams.set('q', referenceText);

    if (workspacePath) {
      url.searchParams.set('cwd', workspacePath);
    }

    return url.toString();
  }

  const url = new URL('codex://new');
  url.searchParams.set('prompt', referenceText);

  if (workspacePath) {
    url.searchParams.set('path', workspacePath);
  }

  return url.toString();
}

async function selectAiCodingTool() {
  const currentTool = getAiCodingTool();
  const items = getAiCodingToolItems().map((item) => ({
    ...item,
    picked: item.value === currentTool
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose the AI coding tool for Cmd+Option+N'
  });

  if (!selected) {
    return;
  }

  const config = vscode.workspace.getConfiguration('copyCodePathRef');
  await config.update('aiCodingTool', selected.value, vscode.ConfigurationTarget.Global);
  vscode.window.setStatusBarMessage(`Copy Code target set to ${selected.label}`, 2500);
}

function getUsageStats(context) {
  const stats = context.globalState.get(USAGE_STATS_KEY, {});
  return USAGE_COMMANDS.reduce((normalizedStats, command) => {
    normalizedStats[command.id] = Number.isInteger(stats[command.id]) ? stats[command.id] : 0;
    return normalizedStats;
  }, {});
}

async function recordUsage(commandId) {
  const context = recordUsage.context;

  if (!context) {
    return;
  }

  const stats = getUsageStats(context);
  stats[commandId] = (stats[commandId] || 0) + 1;
  await context.globalState.update(USAGE_STATS_KEY, stats);
}

async function showUsageStats(context) {
  const stats = getUsageStats(context);
  const total = USAGE_COMMANDS.reduce((sum, command) => sum + stats[command.id], 0);
  const items = USAGE_COMMANDS.map((command) => ({
    label: `${command.shortcut} · ${stats[command.id]} time${stats[command.id] === 1 ? '' : 's'}`,
    description: command.title
  }));

  items.push({
    label: `Total · ${total} time${total === 1 ? '' : 's'}`,
    description: 'Stored locally on this machine'
  });

  await vscode.window.showQuickPick(items, {
    placeHolder: 'Copy Code local shortcut usage'
  });
}

async function openAiCodingToolWithReference() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage('Open a file before sending a codeblock reference to an AI coding tool.');
    return;
  }

  const tool = getAiCodingTool();
  const referenceText = await copyReferenceToClipboard(tool);

  if (!referenceText) {
    return;
  }

  const workspacePath = getWorkspacePath(editor);
  const url = buildAiCodingToolUrl(tool, referenceText, workspacePath);

  await openUrl(url);

  await recordUsage('openAiCodingToolWithReference');

  const references = referenceText.split('\n');
  const toolLabel = getAiCodingToolLabel(tool);
  vscode.window.setStatusBarMessage(`Opened ${toolLabel} with ${references.length} code reference${references.length === 1 ? '' : 's'}`, 2500);
}

async function sendReferenceToActiveTerminal() {
  const terminal = vscode.window.activeTerminal;

  if (!terminal) {
    vscode.window.showWarningMessage('Open a terminal before sending a codeblock reference.');
    return;
  }

  const referenceText = await copyReferenceToClipboard('claudeCode');

  if (!referenceText) {
    return;
  }

  terminal.show();
  terminal.sendText(referenceText, false);

  await recordUsage('sendReferenceToActiveTerminal');

  const references = referenceText.split('\n');
  vscode.window.setStatusBarMessage(`Sent ${references.length} code reference${references.length === 1 ? '' : 's'} to the active terminal`, 2500);
}

function activate(context) {
  recordUsage.context = context;

  const copyDisposable = vscode.commands.registerCommand(
    'copy-code-path-ref.copyReference',
    copyReference
  );

  const openAiCodingToolDisposable = vscode.commands.registerCommand(
    'copy-code-path-ref.openAiCodingToolWithReference',
    openAiCodingToolWithReference
  );

  const sendToTerminalDisposable = vscode.commands.registerCommand(
    'copy-code-path-ref.sendReferenceToActiveTerminal',
    sendReferenceToActiveTerminal
  );

  const selectAiCodingToolDisposable = vscode.commands.registerCommand(
    'copy-code-path-ref.selectAiCodingTool',
    selectAiCodingTool
  );

  const showUsageStatsDisposable = vscode.commands.registerCommand(
    'copy-code-path-ref.showUsageStats',
    () => showUsageStats(context)
  );

  context.subscriptions.push(
    copyDisposable,
    openAiCodingToolDisposable,
    sendToTerminalDisposable,
    selectAiCodingToolDisposable,
    showUsageStatsDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  getLineRange,
  formatClaudeCodeReference,
  formatCodexReference,
  escapeMarkdownLinkLabel,
  formatMarkdownLinkDestination,
  formatReference,
  getReferences,
  parseJsonQuery,
  getDocumentFilePath,
  copyReferenceToClipboard,
  openUrl,
  getWorkspacePath,
  getAiCodingTool,
  getAiCodingToolLabel,
  getAiCodingToolItems,
  buildAiCodingToolUrl,
  selectAiCodingTool,
  getUsageStats,
  recordUsage,
  showUsageStats,
  openAiCodingToolWithReference,
  sendReferenceToActiveTerminal
};

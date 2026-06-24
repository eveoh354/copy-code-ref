const vscode = require('vscode');
const { execFile } = require('child_process');

function getLineRange(selection) {
  const startLine = selection.start.line + 1;
  let endLine = selection.end.line + 1;

  if (!selection.isEmpty && selection.end.character === 0 && selection.end.line > selection.start.line) {
    endLine -= 1;
  }

  return { startLine, endLine };
}

function formatReference(filePath, startLine, endLine) {
  if (startLine === endLine) {
    return `${filePath}#L${startLine} `;
  }

  return `${filePath}#L${startLine}-${endLine} `;
}

function getReferences(filePath, selections) {
  return selections.map((selection) => {
    const { startLine, endLine } = getLineRange(selection);
    return formatReference(filePath, startLine, endLine);
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

  const references = referenceText.split('\n');
  vscode.window.setStatusBarMessage(`Copied ${references.length} code reference${references.length === 1 ? '' : 's'}`, 2500);
}

async function copyReferenceToClipboard() {
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

  const references = getReferences(filePath, editor.selections);
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

async function openAiCodingToolWithReference() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage('Open a file before sending a codeblock reference to an AI coding tool.');
    return;
  }

  const referenceText = await copyReferenceToClipboard();

  if (!referenceText) {
    return;
  }

  const tool = getAiCodingTool();
  const workspacePath = getWorkspacePath(editor);
  const url = buildAiCodingToolUrl(tool, referenceText, workspacePath);

  await openUrl(url);

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

  const referenceText = await copyReferenceToClipboard();

  if (!referenceText) {
    return;
  }

  terminal.show();
  terminal.sendText(referenceText, false);

  const references = referenceText.split('\n');
  vscode.window.setStatusBarMessage(`Sent ${references.length} code reference${references.length === 1 ? '' : 's'} to the active terminal`, 2500);
}

function activate(context) {
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

  context.subscriptions.push(
    copyDisposable,
    openAiCodingToolDisposable,
    sendToTerminalDisposable,
    selectAiCodingToolDisposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  getLineRange,
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
  openAiCodingToolWithReference,
  sendReferenceToActiveTerminal
};

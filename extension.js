const vscode = require('vscode');

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
    return `${filePath}#L${startLine}`;
  }

  return `${filePath}#L${startLine}-${endLine}`;
}

function getReferences(filePath, selections) {
  return selections.map((selection) => {
    const { startLine, endLine } = getLineRange(selection);
    return formatReference(filePath, startLine, endLine);
  });
}

async function copyReference() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage('Open a file before copying a codeblock reference.');
    return;
  }

  if (editor.document.uri.scheme !== 'file') {
    vscode.window.showWarningMessage('Codeblock references can only be copied from local files.');
    return;
  }

  const references = getReferences(editor.document.uri.fsPath, editor.selections);
  const referenceText = references.join('\n');

  await vscode.env.clipboard.writeText(referenceText);
  vscode.window.setStatusBarMessage(`Copied ${references.length} code reference${references.length === 1 ? '' : 's'}`, 2500);
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    'copy-code-ref.copyReference',
    copyReference
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  getLineRange,
  formatReference,
  getReferences
};

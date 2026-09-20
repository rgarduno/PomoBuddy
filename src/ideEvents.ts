import * as vscode from 'vscode';
import { IdeReactionType } from './types';

export class IdeEventsListener {
  private disposables: vscode.Disposable[] = [];
  private hadErrorsInActiveDoc = false;
  private debounceTimeout: NodeJS.Timeout | null = null;

  public onReaction: ((reaction: IdeReactionType, message?: string) => void) | null = null;

  constructor() {
    this.registerDiagnosticsListener();
    this.registerSaveListener();
  }

  private registerDiagnosticsListener() {
    const diagSub = vscode.languages.onDidChangeDiagnostics(() => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.debounceTimeout = setTimeout(() => {
        this.checkActiveDocumentDiagnostics();
      }, 1200);
    });

    const editorChangeSub = vscode.window.onDidChangeActiveTextEditor(() => {
      this.checkActiveDocumentDiagnostics();
    });

    this.disposables.push(diagSub, editorChangeSub);
  }

  private checkActiveDocumentDiagnostics() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return;
    }

    const uri = activeEditor.document.uri;
    // Ignorar esquemas que no sean archivos reales (output, git, debug, etc.)
    if (uri.scheme !== 'file') {
      return;
    }

    const fsPath = uri.fsPath.toLowerCase();
    // Edge Case: Ignorar archivos generados, minificados, dependencias masivas o bloqueadas
    if (
      fsPath.includes('node_modules') ||
      fsPath.includes('/dist/') ||
      fsPath.includes('/out/') ||
      fsPath.includes('/.git/') ||
      fsPath.endsWith('.min.js') ||
      fsPath.endsWith('.min.css') ||
      fsPath.endsWith('package-lock.json') ||
      fsPath.endsWith('yarn.lock')
    ) {
      return;
    }

    // Edge Case: Proteger contra archivos masivos (dumps, datasets JSON gigantes > 500 KB)
    if (activeEditor.document.lineCount > 10000 || activeEditor.document.getText().length > 500000) {
      return;
    }

    const diagnostics = vscode.languages.getDiagnostics(uri);
    const errorCount = diagnostics.filter(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    ).length;

    if (errorCount > 0) {
      if (!this.hadErrorsInActiveDoc) {
        this.hadErrorsInActiveDoc = true;
        const msg =
          errorCount === 1
            ? '¡Ups! Hay 1 error en tu código 😵‍💫'
            : `¡Cuidado! Hay ${errorCount} errores en tu código 😵‍💫`;
        this.emitReaction('ERROR', msg);
      }
    } else {
      if (this.hadErrorsInActiveDoc) {
        this.hadErrorsInActiveDoc = false;
        this.emitReaction('FIXED', '¡Bugs solucionados! Código limpio ✨');
      }
    }
  }

  private registerSaveListener() {
    const saveSub = vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme !== 'file') {
        return;
      }
      this.emitReaction('SAVED', '¡Cambios guardados! Buen progreso 👍');
    });

    this.disposables.push(saveSub);
  }

  private emitReaction(reaction: IdeReactionType, message?: string) {
    if (this.onReaction) {
      this.onReaction(reaction, message);
    }
  }

  public dispose() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.disposables.forEach((d) => d.dispose());
  }
}

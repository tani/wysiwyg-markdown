import * as vscode from 'vscode';

/**
 * Provider for Vditor editors.
 */
export class VditorEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new VditorEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(VditorEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'wysiwyg-markdown.vditor';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    /**
     * Called when our custom editor is opened.
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'ready':
                    updateWebview();
                    return;
                case 'change':
                    this.updateTextDocument(document, e.text);
                    return;
            }
        });

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to Vditor assets (bundled in dist)
        const vditorDir = vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'vditor');
        const vditorUri = webview.asWebviewUri(vditorDir);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${vditorUri}/dist/index.css" />
                <script src="${vditorUri}/dist/index.min.js"></script>
                <style>
                    body {
                        padding: 0;
                        margin: 0;
                        overflow: hidden;
                        height: 100vh;
                        background: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    #vditor {
                        height: 100vh !important;
                        border: none !important;
                    }
                    /* Adapt scrollbars and basic UI */
                    ::-webkit-scrollbar { width: 10px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); }
                    ::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }
                </style>
            </head>
            <body class="${vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'vscode-dark' : 'vscode-light'}">
                <div id="vditor"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    let vditor;
                    let isUpdating = false;

                    function getVditorTheme() {
                        return document.body.classList.contains('vscode-dark') ? 'dark' : 'classic';
                    }

                    vditor = new Vditor('vditor', {
                        cdn: '${vditorUri}',
                        mode: 'wysiwyg',
                        height: '100vh',
                        theme: getVditorTheme(),
                        preview: {
                           theme: {
                               current: getVditorTheme() === 'dark' ? 'dark' : 'light'
                           }
                        },
                        cache: {
                            enable: false,
                        },
                        input(value) {
                            if (isUpdating) return;
                            vscode.postMessage({
                                type: 'change',
                                text: value
                            });
                        },
                        after() {
                            vscode.postMessage({ type: 'ready' });
                        }
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'update':
                                const text = message.text;
                                if (vditor.getValue() !== text) {
                                    isUpdating = true;
                                    vditor.setValue(text);
                                    isUpdating = false;
                                }
                                break;
                        }
                    });
                </script>
            </body>
            </html>`;
    }

    /**
     * Write out the text to a document.
     */
    private updateTextDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();

        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text);

        return vscode.workspace.applyEdit(edit);
    }
}

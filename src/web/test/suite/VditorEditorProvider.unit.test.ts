import * as assert from 'assert';
import * as vscode from 'vscode';
import { VditorEditorProvider } from '../../VditorEditorProvider';

suite('VditorEditorProvider Unit Test Suite', () => {
    test('Should break the circular update loop using isEditing flag', async () => {
        // Setup a dummy workspace and document
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, 'unit_test.md');
        await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode('# Initial'));
        const document = await vscode.workspace.openTextDocument(uri);

        // Mock context and other VS Code objects
        const mockContext = { 
            extensionUri: vscode.Uri.file('/tmp') 
        } as unknown as vscode.ExtensionContext;

        const provider = new VditorEditorProvider(mockContext);
        
        let postMessageCount = 0;
        let lastMessage: any;
        
        const messageEmitter = new vscode.EventEmitter<any>();
        
        const mockWebview = {
            asWebviewUri: (uri: vscode.Uri) => uri,
            onDidReceiveMessage: messageEmitter.event,
            postMessage: async (msg: any) => {
                postMessageCount++;
                lastMessage = msg;
                return true;
            },
            options: {}
        } as unknown as vscode.Webview;

        const mockWebviewPanel = {
            webview: mockWebview,
            onDidDispose: new vscode.EventEmitter<void>().event,
            viewType: 'test.view'
        } as unknown as vscode.WebviewPanel;

        // Call the provider entry point
        await provider.resolveCustomTextEditor(document, mockWebviewPanel, { isCancellationRequested: false } as any);

        // 1. Check initial update when ready is received
        messageEmitter.fire({ type: 'ready' });
        await new Promise(r => setTimeout(r, 10)); 
        assert.strictEqual(postMessageCount, 1, 'Webview should be updated when ready');
        assert.strictEqual(lastMessage.type, 'update');
        assert.strictEqual(lastMessage.text, '# Initial');

        // 2. Simulate user change from webview -> should update document but NOT send message back
        postMessageCount = 0;
        messageEmitter.fire({ type: 'change', text: '# Changed by Webview' });
        
        // Wait for document update
        for (let i = 0; i < 20; i++) {
            if (document.getText() === '# Changed by Webview') {break;}
            await new Promise(r => setTimeout(r, 50));
        }
        assert.strictEqual(document.getText(), '# Changed by Webview', 'Document should be updated');
        assert.strictEqual(postMessageCount, 0, 'Circular update should be suppressed by isEditing flag');

        // 3. Simulate external change -> should update webview
        postMessageCount = 0;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, new vscode.Range(0, 0, document.lineCount, 0), '# Changed Externally');
        await vscode.workspace.applyEdit(edit);
        
        // Wait for event relay
        for (let i = 0; i < 20; i++) {
            if (postMessageCount > 0) {break;}
            await new Promise(r => setTimeout(r, 50));
        }
        assert.strictEqual(postMessageCount, 1, 'External change should trigger webview update');
        assert.strictEqual(lastMessage.text, '# Changed Externally');

        // 4. Simulate auto-save style change (e.g. adding trailing newline that matches after normalization)
        postMessageCount = 0;
        const autoSaveEdit = new vscode.WorkspaceEdit();
        autoSaveEdit.replace(uri, new vscode.Range(0, 0, document.lineCount, 0), '# Changed Externally\n\n');
        await vscode.workspace.applyEdit(autoSaveEdit);
        
        await new Promise(r => setTimeout(r, 100));
        assert.strictEqual(postMessageCount, 0, 'Auto-save (normalization match) should NOT trigger webview update');
        
        // Cleanup
        try {
            await vscode.workspace.fs.delete(uri);
        } catch {
            // ignore
        }
    });
});

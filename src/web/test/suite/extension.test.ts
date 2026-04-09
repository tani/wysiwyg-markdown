import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Web Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('masaya.wysiwyg-markdown'));
        console.log('Workspace folders:', vscode.workspace.workspaceFolders?.map(f => f.uri.toString()));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('masaya.wysiwyg-markdown');
		await extension?.activate();
		assert.strictEqual(extension?.isActive, true);
	});

    test('Should have workspace folders', () => {
        assert.ok(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0, 'Workspace folders should not be empty');
    });

    test('Should be able to open README.md with Vditor', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, 'README.md');
        
        // Explicitly open with the custom editor
        await vscode.commands.executeCommand('vscode.openWith', uri, 'wysiwyg-markdown.vditor');
        
        // When a custom editor is open, activeTextEditor is usually undefined.
        assert.strictEqual(vscode.window.activeTextEditor, undefined, 'Active text editor should be undefined for custom editor');
    });

    test('Should sync changes from a TextDocument externally', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0];
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, 'sync_test.md');
        await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode('# Sync Test'));
        
        try {
            await vscode.commands.executeCommand('vscode.openWith', uri, 'wysiwyg-markdown.vditor');
            
            // Edit the document externally
            const doc = await vscode.workspace.openTextDocument(uri);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), '# Edited Content');
            const success = await vscode.workspace.applyEdit(edit);
            assert.ok(success, 'Should be able to apply external edit');
            
            // Re-read document to verify edit
            assert.strictEqual(doc.getText(), '# Edited Content');
        } finally {
            // Cleanup
            try {
                await vscode.workspace.fs.delete(uri);
            } catch (e) {
                // Ignore if already deleted
            }
        }
    });
});

import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Web Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('tani.wysiwyg-markdown'));
        console.log('Workspace folders:', vscode.workspace.workspaceFolders?.map(f => f.uri.toString()));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('tani.wysiwyg-markdown');
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
});

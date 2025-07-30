import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "phaser-viewer" is now active!');

    let disposable = vscode.commands.registerCommand('phaser-viewer.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Phaser Viewer!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
import * as vscode from 'vscode';

export class PhaserWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'phaser-viewer.preview';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    public showPreview(gameObjectCode: string) {
        if (this._view) {
            this._view.show?.(true);
            this._view.webview.postMessage({ 
                command: 'loadGameObject', 
                code: gameObjectCode 
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:;">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Phaser Viewer</title>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                    #game-container { width: 100%; height: 100vh; }
                </style>
            </head>
            <body>
                <div id="game-container"></div>
                <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    let game = null;

                    class PreviewScene extends Phaser.Scene {
                        constructor() {
                            super({ key: 'PreviewScene' });
                        }

                        create() {
                            this.add.text(400, 300, 'Phaser Viewer Ready', { 
                                fontSize: '32px', 
                                color: '#ffffff' 
                            }).setOrigin(0.5);
                        }
                    }

                    const config = {
                        type: Phaser.AUTO,
                        width: 800,
                        height: 600,
                        parent: 'game-container',
                        backgroundColor: '#2d2d2d',
                        scene: PreviewScene
                    };

                    game = new Phaser.Game(config);

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'loadGameObject':
                                // TODO: Implement GameObject loading
                                console.log('Loading GameObject:', message.code);
                                break;
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
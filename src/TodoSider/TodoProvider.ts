import { privateEncrypt } from 'crypto';
import * as vscode from 'vscode';
const webContent = require("./web/index");

export class CustomizeItem extends vscode.TreeItem {

}

export class TodoTreeDataProvider implements vscode.TreeDataProvider<CustomizeItem> {

  // onDidChangeTreeData?: vscode.Event<void | null | undefined | CustomizeItem> | undefined;

  getTreeItem(element: CustomizeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: CustomizeItem): vscode.ProviderResult<CustomizeItem[]> {
    const childs: Array<CustomizeItem> = [];
    if (element) {
      for (let i = 0; i < 3; i++) {
        childs.push(
          new CustomizeItem(i.toString(), vscode.TreeItemCollapsibleState.None)
        );
      }
      return childs;
    }
    return [new CustomizeItem("root", vscode.TreeItemCollapsibleState.Collapsed)];
  }
}

export class TodoWebviewProvider implements vscode.WebviewViewProvider {
  _view?: vscode.Webview;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext<unknown>, _token: vscode.CancellationToken): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      console.log(data);
    });

    // @ts-ignore
    this._view = webviewView;
  }

  private _getHtml(webview: vscode.Webview) {
    // @ts-ignore
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "TodoSider", "web", "index.js"));
    // @ts-ignore
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "TodoSider", "web", "index.css"));
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TodoSiderWebview</title>
      <link rel="stylesheet" href="${styleUri}" type="text/css" />
    </head>
    <body>
      <div id="main">
        <div id="header">
          <div class="header-item header-item-active">
            <span>N</span>
          </div>
          <div class="header-item">
            <span>P</span>
          </div>
          <div class="header-item">
            <span>F</span>
          </div>
        </div>
        <div id="content">
          
        </div>
        <div id="form">
          <div>
            <input placeholder="输入需要添加的内容" id="form-input"/>
          </div>
        </div>
      </div>
      <script nonce="121313" src="${scriptUri}"></script>
    </body>
    </html>
    `;
  }
}

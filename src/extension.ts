// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Panel } from './Panel';
import { TodoWebviewProvider, TodoTreeDataProvider } from './TodoSider';


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "dexian-take-rest" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('dexian-take-rest.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from dexian_take_rest)!');
			Panel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			"todoSider-view",
			new TodoTreeDataProvider()
		)
	);
	console.log(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"todoSider-webview",
			new TodoWebviewProvider(context.extensionUri)
		)
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
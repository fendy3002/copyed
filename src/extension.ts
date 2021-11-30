// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "copyed" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('copyed.list', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from copyed!');

		let gistFiles: any = {};
		try {
			let gistId = workspace.getConfiguration("copyed").get("gistId");
			let gistCallResult = await superagent.get(`https://api.github.com/gists/${gistId}`)
				.set("accept", "application/vnd.github.v3+json")
				.set("User-Agent", "VSCode 1.4.0");

			gistFiles = gistCallResult.body.files;
		} catch (ex) {
			console.log(ex);
		}
		const chosenFile = await window.showQuickPick(Object.keys(gistFiles), {
			placeHolder: 'Choose snippet',
		});
		let content = gistFiles[chosenFile ?? ""]?.content;
		if (content) {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const selection = editor.selection;
				editor.edit(editBuilder => {
					editBuilder.insert(selection.start, content);
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

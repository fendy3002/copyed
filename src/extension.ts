// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { set } from './set';
import { setEach } from './setEach';
import { list } from './list';
import { load } from './load';
import { insert } from './insert';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "copyed" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('copyed.set', set(context)));
	context.subscriptions.push(vscode.commands.registerCommand('copyed.setEach', setEach(context)));
	context.subscriptions.push(vscode.commands.registerCommand('copyed.list', list(context)));
	context.subscriptions.push(vscode.commands.registerCommand('copyed.load', load(context)));
	context.subscriptions.push(vscode.commands.registerCommand('copyed.insert', insert(context)));
}

// this method is called when your extension is deactivated
export function deactivate() { }

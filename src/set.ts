import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
import * as util from 'util';
//const { vsprintf } = require('sprintf-js');

export const set = (context: vscode.ExtensionContext) => async () => {
    let gistFiles: any = {};
    let gistId = workspace.getConfiguration("copyed").get("gistId");
    let delimiter = workspace.getConfiguration("copyed").get("argsDelimiter") as string;
    try {
        let gistCallResult = await superagent.get(`https://api.github.com/gists/${gistId}`)
            .set("accept", "application/vnd.github.v3+json")
            .set("User-Agent", "VSCode 1.4.0");

        gistFiles = gistCallResult.body.files;
    } catch (ex) {
        return vscode.window.showErrorMessage(ex.message);
    }
    const chosenFile = await window.showQuickPick(Object.keys(gistFiles), {
        placeHolder: 'Choose snippet',
    });
    let content = gistFiles[chosenFile ?? ""]?.content;
    if (content) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            let selectionText = "";
            if (selection.start.line != selection.end.line ||
                selection.start.character != selection.end.character) {
                selectionText = editor.document.getText(selection);
            }
            else {
                selectionText = editor.document.lineAt(editor.selection.active.line).text;
            }
            let args = selectionText.split(delimiter);
            if (args) {
                content = util.format.apply(util, [content].concat(args));
            }

            editor.edit(editBuilder => {
                if (selection.start.line != selection.end.line ||
                    selection.start.character != selection.end.character) {
                    editor.selection.start.with(editor.selection.active.line, 0);
                    editBuilder.replace(selection, content);
                } else {
                    editBuilder.replace(editor.document.lineAt(editor.selection.active.line).range, content);
                }
            });
        }
    }
}
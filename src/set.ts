import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
import { cacheManager } from './helper/cacheManager';
import * as util from 'util';
//const { vsprintf } = require('sprintf-js');

export const set = (context: vscode.ExtensionContext) => async () => {
    let delimiter = workspace.getConfiguration("copyed").get("argsDelimiter") as string;
    const _cacheManager = cacheManager(context);
    let files: string[] | null = _cacheManager.getFileNames();
    if (!files) {
        return;
    }

    const chosenFile = await window.showQuickPick(files, {
        placeHolder: 'Choose snippet',
    });
    let content = _cacheManager.getFileContent(chosenFile ?? "");
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
                    editBuilder.replace(selection, content as string);
                } else {
                    editBuilder.replace(editor.document.lineAt(editor.selection.active.line).range, content as string);
                }
            });
        }
    }
}
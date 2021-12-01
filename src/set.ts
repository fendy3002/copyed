import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as path from 'path';
import * as util from 'util';
import { getNunjucks } from './helper/getNunjucks';
import { cacheManager } from './helper/cacheManager';
//const { vsprintf } = require('sprintf-js');

export const set = (context: vscode.ExtensionContext) => async () => {
    let delimiter = workspace.getConfiguration("copyed").get("argsDelimiter") as string;
    let keyValueDelimiter = workspace.getConfiguration("copyed").get("keyValueDelimiter") as string;
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
            let fileExtension = path.extname(chosenFile ?? "");
            if (fileExtension == ".njs") {
                let args = selectionText.split(delimiter);
                let nunjucksContext: any = {};
                let argsIndex = 0;
                for (let arg of args) {
                    let splitted = arg.split(keyValueDelimiter);
                    // exactly key:value
                    if (splitted.length == 2) {
                        nunjucksContext[splitted[0].trim()] = splitted[1].trim();
                    } else {
                        nunjucksContext[argsIndex] = arg;
                        argsIndex++;
                    }
                }
                content = getNunjucks().renderString(content, {
                    _: nunjucksContext,
                    get: (namedArgs: string | null, argsIndex: number | null, nullDisplay: string | null) => {
                        if (namedArgs && nunjucksContext[namedArgs]) {
                            return nunjucksContext[namedArgs];
                        } else if ((argsIndex || argsIndex === 0) && nunjucksContext[argsIndex]) {
                            return nunjucksContext[argsIndex];
                        } else {
                            return nullDisplay ?? "";
                        }
                    }
                });
            } else {
                let args = selectionText.split(delimiter);
                if (args) {
                    content = util.format.apply(util, [content].concat(args));
                }
            }

            editor.edit(editBuilder => {
                if (selection.start.line != selection.end.line ||
                    selection.start.character != selection.end.character) {
                    editBuilder.replace(selection, content as string);
                } else {
                    editor.selection = new vscode.Selection(
                        editor.selection.start.with(editor.selection.start.line, 0), editor.selection.end
                    );
                    editBuilder.replace(editor.document.lineAt(editor.selection.active.line).range, content as string);
                }
            });
        }
    }
}
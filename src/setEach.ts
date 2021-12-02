import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as path from 'path';
import * as util from 'util';
import { getNunjucks } from './helper/getNunjucks';
import { cacheManager } from './helper/cacheManager';
import { parseNunjucksArgs } from './helper/parseNunjucksArgs';
import * as type from './type';
//const { vsprintf } = require('sprintf-js');

export const setEach = (context: vscode.ExtensionContext) => async () => {
    let delimiter = workspace.getConfiguration("copyed").get("argsDelimiter") as string;
    let keyValueDelimiter = workspace.getConfiguration("copyed").get("keyValueDelimiter") as string;
    const _cacheManager = cacheManager(context);
    let cacheInfo: type.CacheInfo = _cacheManager.getCacheInfo();
    if (!cacheInfo) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const languageId = editor.document.languageId;
    const options = _cacheManager.getChoiceOptionsFromCache(languageId);

    const chosenOption = await window.showQuickPick(options, {
        placeHolder: 'Choose snippet',
    }) ?? "";
    if (!chosenOption) {
        return;
    }
    let chosenFile = "";
    if (chosenOption.indexOf(":") >= 0) {
        let chosenOptionParts = chosenOption.split(":");
        let chosenLanguage = chosenOptionParts[0];
        let chosenShortFileName = chosenOptionParts.slice(1).join(":");
        chosenFile = cacheInfo.map[chosenLanguage][chosenShortFileName].fullName;
    } else {
        chosenFile = (cacheInfo.map[languageId]?.[chosenOption] ?? cacheInfo.map["*"]?.[chosenOption]).fullName;
    }
    let template = _cacheManager.getFileContent(chosenFile ?? "");
    if (template) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let content = "";
            const selection = editor.selection;
            let selectionText = "";
            if (selection.start.line != selection.end.line ||
                selection.start.character != selection.end.character) {
                selectionText = editor.document.getText(selection);
            }
            else {
                selectionText = editor.document.lineAt(editor.selection.active.line).text;
            }
            selectionText = selectionText.trim();
            let selectionLines = selectionText.split("\n");
            if (selectionLines.length == 0) {
                selectionLines.push("");
            }

            let fileExtension = path.extname(chosenFile ?? "");
            if (fileExtension == ".njk") {
                content = selectionLines.map(line => {
                    let nunjucksContext: any = parseNunjucksArgs(line, delimiter, keyValueDelimiter);
                    return getNunjucks().renderString(template as string, {
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
                }).join("\n");
            } else {
                content = selectionLines.map(line => {
                    let args = line.split(delimiter);
                    if (args) {
                        return util.format.apply(util, [template as string].concat(args));
                    }
                }).join("\n");
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
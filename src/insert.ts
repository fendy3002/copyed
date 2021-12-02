import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as path from 'path';
import * as util from 'util';
import { getNunjucks } from './helper/getNunjucks';
import { cacheManager } from './helper/cacheManager';
import * as type from './type';

export const insert = (context: vscode.ExtensionContext) => async () => {
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

    let content = _cacheManager.getFileContent(chosenFile ?? "");
    if (content) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            let fileExtension = path.extname(chosenFile ?? "");
            if (fileExtension == ".njs") {
                let nunjucksContext: any = {};
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
            }

            editor.edit(editBuilder => {
                editBuilder.insert(selection.end, content as string);
            });
        }
    }
}
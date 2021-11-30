import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
export const insert = async () => {
    let gistFiles: any = {};
    try {
        let gistId = workspace.getConfiguration("copyed").get("gistId");
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
            editor.edit(editBuilder => {
                editBuilder.insert(selection.end, content);
            });
        }
    }
}
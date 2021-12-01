import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
export const list = (context: vscode.ExtensionContext) => async () => {
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
    let content = "";
    for (let file of Object.keys(gistFiles)) {
        content += `* ${file}\n`;
    }
    content += `\n`;
    for (let file of Object.keys(gistFiles)) {
        content += `=========================\n`;
        content += `* ${file}\n`;
        content += `=========================\n`;
        content += `\n`;
        content += `${gistFiles[file].content}`;
        content += `\n`;
        content += `\n`;
    }
    const document = await vscode.workspace.openTextDocument({
        content: content
    });
    vscode.window.showTextDocument(document);
}
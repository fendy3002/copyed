import * as vscode from 'vscode';
import { cacheManager } from './helper/cacheManager';
export const list = (context: vscode.ExtensionContext) => async () => {
    const _cacheManager = cacheManager(context);
    let files: string[] | null = _cacheManager.getFileNames();
    if (!files) {
        return;
    }
    let content = "";
    for (let file of files) {
        content += `* ${file}\n`;
    }
    content += `\n`;
    for (let file of files) {
        content += `=========================\n`;
        content += `* ${file}\n`;
        content += `=========================\n`;
        content += `\n`;
        content += `${_cacheManager.getFileContent(file)}`;
        content += `\n`;
        content += `\n`;
    }
    const document = await vscode.workspace.openTextDocument({
        content: content
    });
    vscode.window.showTextDocument(document);
}
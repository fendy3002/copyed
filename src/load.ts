import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
import * as fs from 'fs';
import * as path from 'path';
export const load = (context: vscode.ExtensionContext) => async () => {
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
    const storagePath = context.globalStorageUri.path;
    const fileStoragePath = path.join(storagePath, "files");
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath);
    }
    if (!fs.existsSync(fileStoragePath)) {
        fs.mkdirSync(fileStoragePath);
    } else {
        for (let eachExisting of fs.readdirSync(fileStoragePath)) {
            if (eachExisting == "." || eachExisting == "..") {
                continue;
            }
            fs.unlinkSync(path.join(fileStoragePath, eachExisting));
        }
    }
    for (let file of Object.keys(gistFiles)) {
        const filePath = path.join(fileStoragePath, file);
        fs.writeFileSync(filePath, gistFiles[file].content);
    }
    return vscode.window.showInformationMessage(`copyed: Load / reload complete`);
}
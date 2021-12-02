import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as superagent from 'superagent';
import * as fs from 'fs';
import * as path from 'path';
import * as type from './type';

export const load = (context: vscode.ExtensionContext) => async () => {
    let gistFiles: any = {};
    try {
        let gistId = workspace.getConfiguration("copyed").get("gistId");
        let gistCallResult = await superagent.get(`https://api.github.com/gists/${gistId}`)
            .set("accept", "application/vnd.github.v3+json")
            .set("User-Agent", "VSCode 1.4.0");

        gistFiles = gistCallResult.body.files;
    } catch (ex: any) {
        return vscode.window.showErrorMessage(ex.message);
    }
    const storagePath = context.globalStorageUri.path;
    const cacheInfoPath = path.join(storagePath, "cacheInfo.json");
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
    let cacheInfo: type.CacheInfo = {
        files: [],
        map: {}
    };
    for (let file of Object.keys(gistFiles)) {
        if (file.indexOf(":") < 0) {
            cacheInfo.map["*"] = cacheInfo.map["*"] ?? {};
            cacheInfo.map["*"][file] = { fullName: file };
            cacheInfo.files.push({
                name: file,
                fullName: file,
                languageId: ["*"]
            });
        } else {
            let fileParts = file.split(":");
            let languageIds = fileParts[0].split(",");
            let fileName = fileParts.slice(1).join(":");
            for (let eachId of languageIds) {
                cacheInfo.map[eachId] = cacheInfo.map[eachId] ?? {};
                cacheInfo.map[eachId][fileName] = {
                    fullName: file,
                };
            }
            cacheInfo.files.push({
                name: fileName,
                fullName: file,
                languageId: languageIds
            });
        }

        const filePath = path.join(fileStoragePath, file);
        fs.writeFileSync(filePath, gistFiles[file].content);
    }
    fs.writeFileSync(cacheInfoPath, JSON.stringify(cacheInfo));
    return vscode.window.showInformationMessage(`copyed: Load / reload complete`);
}
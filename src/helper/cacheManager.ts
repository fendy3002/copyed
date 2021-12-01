import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export const cacheManager = (context: vscode.ExtensionContext) => {
    const fileStoragePath = () => {
        const storagePath = context.globalStorageUri.path;
        const _fileStoragePath = path.join(storagePath, "files");
        return _fileStoragePath;
    };
    return {
        getFileNames: () => {
            if (fs.existsSync(fileStoragePath())) {
                return fs.readdirSync(fileStoragePath());
            } else {
                vscode.window.showInformationMessage(`copyed: Data not exists. Please load / reload first`);
                return null;
            }
        },
        getFileContent: (fileName: string) => {
            let filePath = path.join(fileStoragePath(), fileName);
            try {
                return fs.readFileSync(filePath, "utf8");
            } catch (ex) {
                return null;
            }
        }
    };
};
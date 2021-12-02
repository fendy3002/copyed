import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as lo from 'lodash';

export const cacheManager = (context: vscode.ExtensionContext) => {
    const fileStoragePath = () => {
        const storagePath = context.globalStorageUri.path;
        const _fileStoragePath = path.join(storagePath, "files");
        return _fileStoragePath;
    };
    const cacheInfoPath = () => {
        const storagePath = context.globalStorageUri.path;
        const _cacheInfoPath = path.join(storagePath, "cacheInfo.json");
        return _cacheInfoPath;
    };
    const getCacheInfo = () => {
        if (fs.existsSync(fileStoragePath())) {
            return JSON.parse(fs.readFileSync(cacheInfoPath(), "utf8"));
        } else {
            vscode.window.showInformationMessage(`copyed: Data not exists. Please load / reload first`);
            return null;
        }
    };
    return {
        getCacheInfo: getCacheInfo,
        getChoiceOptionsFromCache: (languageId: string) => {
            const cacheInfo = getCacheInfo();

            let options: string[] = [];
            let allLangFiles = Object.keys(cacheInfo.map["*"] ?? {});
            let filteredFiles = Object.keys(cacheInfo.map[languageId] ?? {});
            let intersectedFile = lo.intersection(allLangFiles, filteredFiles);
            if (intersectedFile.length > 0) {
                let intersectedOption = [];
                for (let each of intersectedFile) {
                    intersectedOption.push(`*:${each}`);
                    intersectedOption.push(`${languageId}:${each}`);
                }
                options = lo.sortBy(
                    lo.difference(
                        allLangFiles, filteredFiles
                    )
                );
            } else {
                options = lo.sortBy(
                    filteredFiles.concat(
                        allLangFiles
                    )
                );
            }
            return options;
        },
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
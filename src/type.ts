export interface CacheInfo {
    files: {
        name: string,
        fullName: string,
        languageId: string[],
    }[],
    map: {
        [languageId: string]: {
            [fileName: string]: {
                fullName: string
            }
        }
    }
};
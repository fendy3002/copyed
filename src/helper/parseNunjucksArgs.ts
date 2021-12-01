export const parseNunjucksArgs = (selectionText: string, argsDelimiter: string, keyValueDelimiter: string) => {
    let nunjucksContext: any = {};
    let args = selectionText.split(argsDelimiter);
    let argsIndex = 0;
    for (let arg of args) {
        let splitted = arg.split(keyValueDelimiter);
        // exactly key:value
        if (splitted.length >= 2) {
            let key = splitted[0].trim();
            let value = splitted.slice(1).join(keyValueDelimiter);
            if (key) {
                nunjucksContext[splitted[0].trim()] = value;
            }
            else {
                nunjucksContext[argsIndex] = value;
                argsIndex++;
            }
        } else {
            nunjucksContext[argsIndex] = arg;
            argsIndex++;
        }
    }
    return nunjucksContext;
};
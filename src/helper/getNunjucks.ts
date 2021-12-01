import * as nunjucks from 'nunjucks';
const env = nunjucks.configure({
    autoescape: false
});
export const getNunjucks = () => {
    return env;
};
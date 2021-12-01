import * as nunjucks from 'nunjucks';
const env = nunjucks.configure({

});
export const getNunjucks = () => {
    return env;
};
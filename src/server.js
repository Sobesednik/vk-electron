const koa = require('koa');
const koaRouter = require('koa-router');
const views = require('koa-views');
const serve = require('koa-static');

class Server {
    constructor() {
        const app = this.app = koa();
        const router = koaRouter();

        router.get('/', function *() {
            yield this.render('index');
        });

        app.use(serve('bower_components'));
        app.use(serve('html/js'));

        app.use(views('views', {
            map: {
                html: 'nunjucks',
            },
        }));

        app.use(router.routes());
    }
    start(port) {
        return new Promise((resolve) => {
            this.app.listen(port, resolve);
        });
    }
}

module.exports = Server;

const Router = require("koa-router");
const routes = require("./routes");
const addUploadRoute = require("./routes/upload")
const router = new Router({
    prefix: '/api-dev/v1'
});

routes.forEach(config => router[config.method.toLowerCase()](config.url, config.handle))
addUploadRoute(router)
module.exports = router.routes();
 
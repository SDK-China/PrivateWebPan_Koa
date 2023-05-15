const Koa = require("koa");
const app = new Koa();
const session = require("koa-session");
const PORT = 8080;
const routes = require("./router")
const session_config = require("./config/session")
const cors = require("koa-cors")
const koaStatic = require("koa-static")
app.keys = ['some secret hurr'];
app.use(cors())
app.use(session(session_config, app));
app.use(routes)
app.use(koaStatic("./static"))
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));

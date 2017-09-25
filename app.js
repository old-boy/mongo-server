/* =================以下是引入模块=======================*/
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const json = require('koa-json');
const onerror = require('koa-onerror');
const static = require('koa-static');
const app = new Koa();
const server = require('http').Server(app.callback());
// const io = require('socket.io')(server);
const config = require('./src/config');
const mongoose = require('./src/config/mongoose.js')();
const router = require('./src/routes/index.js')

/* 静态资源目录 */
app.use(static(__dirname + '/static'));

/* 错误处理 */
onerror(app);

// 中间件
app.use(bodyparser());
app.use(json());

//资源加载记录log
app.use(async(ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 监听端口启动服务
server.listen(config.port, () => console.log("服务已经启动~ \n端口:" + config.port));

/* ================ 以下是路由模块 按类别分发=============== */

// 路由
app.use(router.routes(), router.allowedMethods());

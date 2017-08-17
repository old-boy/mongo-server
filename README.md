# mongo-server
一个使用koa2和mongodb构建的服务。

可以mock数据，反向代理，支持http和tcp。
#### 技术栈：
- nodejs
- koa2
- es6/7
- mockjs
- koa2-pixie-proxy
- RESTful API
- mongoDB
- mongoose
- socket.io

## 使用方法

`git clone https://github.com/shifeng1993/mongo-server.git server`

`cd server`

`npm install`

二选一
`supervisor app` / `node app`

## 项目结构
`app.js`为主文件，平时做模拟数据用`supervisor`启动即可（没有的话用npm安装），也可以用`node`启动。

`routes`目录下为api路由。对应添加即可。

`controllers`目录下为api数据的控制，更改以及序列化。

`models`目录下为对数据的读写。

## 版本特性
#### 1.0.0
1.使用了koa2当做项目底层，node版本要求为大于7.6.0

2.使用了es6/7新特性来做并发，性能更高。

3.使用了shell脚本用 pm2 来守护进程，更稳定。

4.使用了mockjs模拟假数据。

5.添加对数据库的支持，orm模块为`mongoose`。

6.添加了中间层服务代理支持，在`routes/index.js`内部即可轻松添加，项目不需要则删除。

7.添加对websocket的支持，socket.io库。

## 待添加特性
暂无


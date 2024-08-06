const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(createProxyMiddleware("/auth", { target: "http://34.224.65.142:5000/" }));
};

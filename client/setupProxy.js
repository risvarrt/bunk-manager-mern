const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(createProxyMiddleware("/auth", { target: "http://bunk-asg-be-1-1936233079.us-east-1.elb.amazonaws.com:5000/" }));
};

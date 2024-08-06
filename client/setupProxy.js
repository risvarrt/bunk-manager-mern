const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(createProxyMiddleware("/auth", { target: "http://bm-be-asg-lb-1889753560.us-east-1.elb.amazonaws.com:5000/" }));
};

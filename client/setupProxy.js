const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(createProxyMiddleware("/auth", { target: "http://bunk-be-asg-final-load-1502554748.us-east-1.elb.amazonaws.com:5000/" }));
};

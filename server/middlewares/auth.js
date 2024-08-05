const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { findByCredentials } = require('../models/user');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:process.env.AWS_SESSION_TOKEN
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Users";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWTKEY);
    const regdId = decoded._id;
    const params = {
      TableName: tableName,
      Key: {
        regdId: regdId
      }
    };

    const result = await dynamoDB.get(params).promise();
    const user = result.Item;

    if (!user || !user.tokens.some(t => t.token === token)) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;

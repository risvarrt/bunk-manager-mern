const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { findByCredentials } = require('../models/user');
const { fetchSecrets, configureAWS } = require('../config');

let dynamoDB;
let secrets;

const initializeAWS = async () => {
  secrets = await fetchSecrets();
  configureAWS(secrets);
  dynamoDB = new AWS.DynamoDB.DocumentClient();
};

const auth = async (req, res, next) => {
  try {
    if (!dynamoDB) {
      await initializeAWS();
    }
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, secrets.JWTKEY);
    const regdId = decoded._id;
    const params = {
      TableName: "Users",
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

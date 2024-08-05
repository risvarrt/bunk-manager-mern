const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

let dynamoDB;

const init = (awsServices) => {
  dynamoDB = awsServices.docClient;
};

const createUser = async (userData) => {
  const tableName = "Users";
  
  const user = {
    ...userData,
    password: await bcrypt.hash(userData.password, 8),
    tokens: [],
  };

  const params = {
    TableName: tableName,
    Item: user,
  };
  await dynamoDB.put(params).promise();
  return user;
};

const getUserByEmail = async (email) => {
  const tableName = "Users";

  const params = {
    TableName: tableName,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items[0];
};

const generateAuthToken = async (user) => {
  const tableName = "Users";

  const token = jwt.sign({ _id: user.regdId }, "rishivarmanrocks");
  user.tokens.push({ token });

  const params = {
    TableName: tableName,
    Key: { regdId: user.regdId },
    UpdateExpression: "set tokens = :tokens",
    ExpressionAttributeValues: {
      ":tokens": user.tokens,
    },
  };

  await dynamoDB.update(params).promise();
  return token;
};

const findByCredentials = async (email, password) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("No user found with that email");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email or Password wrong. Try Again");
  }
  return user;
};

const removeSensitiveData = (user) => {
  const { password, tokens, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
};

const deleteUser = async (regdId) => {
  const subjectTable = "Subjects";
  const attendanceTable = "Attendances";

  const subjectParams = {
    TableName: subjectTable,
    IndexName: "owner-index",
    KeyConditionExpression: "owner = :owner",
    ExpressionAttributeValues: {
      ":owner": regdId,
    },
  };
  const subjects = await dynamoDB.query(subjectParams).promise();

  for (const subject of subjects.Items) {
    const attendanceParams = {
      TableName: attendanceTable,
      IndexName: "subject-index",
      KeyConditionExpression: "attendanceOf = :attendanceOf",
      ExpressionAttributeValues: {
        ":attendanceOf": subject.id,
      },
    };
    const attendances = await dynamoDB.query(attendanceParams).promise();

    for (const attendance of attendances.Items) {
      const deleteAttendanceParams = {
        TableName: attendanceTable,
        Key: {
          id: attendance.id,
        },
      };
      await dynamoDB.delete(deleteAttendanceParams).promise();
    }

    const deleteSubjectParams = {
      TableName: subjectTable,
      Key: {
        id: subject.id,
      },
    };
    await dynamoDB.delete(deleteSubjectParams).promise();
  }

  const userParams = {
    TableName: "Users",
    Key: {
      regdId: regdId,
    },
  };
  await dynamoDB.delete(userParams).promise();
};

const updateUser = async (regdId, updates) => {
  const tableName = "Users";

  let updateExpression = "set";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const key in updates) {
    updateExpression += ` #${key} = :${key},`;
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updates[key];
  }

  updateExpression = updateExpression.slice(0, -1);

  const params = {
    TableName: tableName,
    Key: { regdId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const logoutUser = async (email, token) => {
  const user = await getUserByEmail(email);
  user.tokens = user.tokens.filter((t) => t.token !== token);
  const params = {
    TableName: "Users",
    Key: { regdId: user.regdId },
    UpdateExpression: "set tokens = :tokens",
    ExpressionAttributeValues: {
      ":tokens": user.tokens
    }
  };

  await dynamoDB.update(params).promise();
  return user;
};

const logoutAllSessions = async (email) => {
  const user = await getUserByEmail(email);
  user.tokens = [];

  const params = {
    TableName: "Users",
    Key: { regdId: user.regdId },
    UpdateExpression: "set tokens = :tokens",
    ExpressionAttributeValues: {
      ":tokens": user.tokens
    }
  };

  await dynamoDB.update(params).promise();
  return user;
};

module.exports = {
  init,
  createUser,
  getUserByEmail,
  generateAuthToken,
  findByCredentials,
  removeSensitiveData,
  deleteUser,
  updateUser,
  logoutUser,
  logoutAllSessions,
};

const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:process.env.AWS_SESSION_TOKEN
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Users";

const createUser = async (userData) => {
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

// Function to get user by email
const getUserByEmail = async (email) => {
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

// Function to generate auth token
const generateAuthToken = async (user) => {
  const token = jwt.sign({ _id: user.regdId }, process.env.JWTKEY);
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

// Function to find user by credentials
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

// Function to remove sensitive data before sending response
const removeSensitiveData = (user) => {
  const { password, tokens, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
};

// Function to delete user and their related data
const deleteUser = async (regdId) => {
  // Deleting subjects and attendances related to the user
  const subjectParams = {
    TableName: "Subjects",
    IndexName: "owner-index",
    KeyConditionExpression: "owner = :owner",
    ExpressionAttributeValues: {
      ":owner": regdId,
    },
  };
  const subjects = await dynamoDB.query(subjectParams).promise();

  for (const subject of subjects.Items) {
    const attendanceParams = {
      TableName: "Attendances",
      IndexName: "subject-index",
      KeyConditionExpression: "attendanceOf = :attendanceOf",
      ExpressionAttributeValues: {
        ":attendanceOf": subject.id,
      },
    };
    const attendances = await dynamoDB.query(attendanceParams).promise();

    for (const attendance of attendances.Items) {
      const deleteAttendanceParams = {
        TableName: "Attendances",
        Key: {
          id: attendance.id,
        },
      };
      await dynamoDB.delete(deleteAttendanceParams).promise();
    }

    const deleteSubjectParams = {
      TableName: "Subjects",
      Key: {
        id: subject.id,
      },
    };
    await dynamoDB.delete(deleteSubjectParams).promise();
  }

  // Deleting user
  const userParams = {
    TableName: tableName,
    Key: {
      regdId: regdId,
    },
  };
  await dynamoDB.delete(userParams).promise();
};

module.exports = {
  createUser,
  getUserByEmail,
  generateAuthToken,
  findByCredentials,
  removeSensitiveData,
  deleteUser,
  dynamoDB
};

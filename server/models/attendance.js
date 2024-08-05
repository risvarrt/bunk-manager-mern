const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:process.env.AWS_SESSION_TOKEN
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Attendances";

// Function to create a new attendance record
const createAttendance = async (attendanceData) => {
  const attendance = {
    id: uuidv4(),
    ...attendanceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const params = {
    TableName: tableName,
    Item: attendance,
  };

  await dynamoDB.put(params).promise();
  return attendance;
};

// Function to get attendance records by subject ID
const getAttendancesBySubject = async (subjectId) => {
  const params = {
    TableName: tableName,
    IndexName: "subject-index",
    KeyConditionExpression: "attendanceOf = :attendanceOf",
    ExpressionAttributeValues: {
      ":attendanceOf": subjectId,
    },
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

// Function to update an attendance record by ID
const updateAttendance = async (id, updateData) => {
  const updateExpression = Object.keys(updateData)
    .map((key) => `#${key} = :${key}`)
    .join(', ');
  const expressionAttributeNames = Object.keys(updateData).reduce(
    (acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    },
    {}
  );
  const expressionAttributeValues = Object.keys(updateData).reduce(
    (acc, key) => {
      acc[`:${key}`] = updateData[key];
      return acc;
    },
    {}
  );

  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: `set ${updateExpression}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

// Function to delete an attendance record by ID
const deleteAttendance = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  await dynamoDB.delete(params).promise();
};

module.exports = {
  createAttendance,
  getAttendancesBySubject,
  updateAttendance,
  deleteAttendance,
};

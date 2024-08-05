const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


let dynamoDB;

const init = (awsServices) => {
  dynamoDB = awsServices.docClient;
};
const tableName = "Attendances";

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

const deleteAttendance = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  await dynamoDB.delete(params).promise();
};

module.exports = {
  init,
  createAttendance,
  getAttendancesBySubject,
  updateAttendance,
  deleteAttendance,
};

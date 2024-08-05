const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:process.env.AWS_SESSION_TOKEN
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Subjects";

// Function to create a new subject
const createSubject = async (subjectData) => {
  const subject = {
    id: uuidv4(),
    ...subjectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const params = {
    TableName: tableName,
    Item: subject,
  };
  await dynamoDB.put(params).promise();
  return subject;
};

// Function to get a subject by ID
const getSubjectById = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

const updateSubject = async (id, updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error("Update data must not be empty");
  }

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

  try {
    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

// Function to delete a subject by ID
const deleteSubject = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  await dynamoDB.delete(params).promise();
};

// Function to get subjects by semester and owner
const getSubjectsBySemester = async (owner, semester) => {
  if (!owner || !semester) {
    throw new Error("Both owner and semester are required.");
  }

  const params = {
    TableName: tableName,
    IndexName: "owner-semester-index",
    KeyConditionExpression: "#owner = :owner AND #semester = :semester",
    ExpressionAttributeNames: {
      "#owner": "owner",
      "#semester": "semester",
    },
    ExpressionAttributeValues: {
      ":owner": owner,
      ":semester": semester.toString(), 
    },
  };


  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error("Unable to fetch subjects:", error);
    throw error;
  }
};

const deactivateSubjects = async (owner, semester) => {
  const params = {
    TableName: tableName,
    IndexName: "owner-semester-index",
    KeyConditionExpression: "#owner = :owner AND #semester = :semester",
    ExpressionAttributeNames: {
      "#owner": "owner",
      "#semester": "semester",
    },
    ExpressionAttributeValues: {
      ":owner": owner,
      ":semester": semester.toString(),
    },
  };

  console.log("Query Params:", JSON.stringify(params, null, 2)); // Add detailed logging

  try {
    const result = await dynamoDB.query(params).promise();
    const subjects = result.Items;
    console.log("Query Result:", JSON.stringify(subjects, null, 2)); // Add detailed logging

    for (const subject of subjects) {
      await updateSubject(subject.id, { active: false });
    }

    return subjects;
  } catch (error) {
    console.error("Unable to fetch subjects:", error);
    throw error;
  }
};

const getAllSemesters = async (owner) => {
  const params = {
    TableName: tableName,
    IndexName: "owner-semester-index",
    KeyConditionExpression: "#owner = :owner",
    ExpressionAttributeNames: {
      "#owner": "owner",
    },
    ExpressionAttributeValues: {
      ":owner": owner,
    },
    ProjectionExpression: "semester",
  };

  try {
    const result = await dynamoDB.query(params).promise();
    const semesters = result.Items.map(item => item.semester);
    const uniqueSemesters = [...new Set(semesters)];
    return uniqueSemesters;
  } catch (error) {
    console.error("Unable to fetch semesters:", error);
    throw error;
  }
};
module.exports = {
  dynamoDB,
  getAllSemesters,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsBySemester,
  deactivateSubjects,
};

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


const tableName = "Subjects";

let dynamoDB;

const init = (awsServices) => {
  dynamoDB = awsServices.docClient;
};
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

const deleteSubject = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };

  await dynamoDB.delete(params).promise();
};

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


  try {
    const result = await dynamoDB.query(params).promise();
    const subjects = result.Items;

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
  init,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsBySemester,
  deactivateSubjects,
  getAllSemesters,
};

const AWS = require('aws-sdk');

const createTables = async () => {
  const dynamoDB = new AWS.DynamoDB(); 
  const tables = [
    {
      TableName: "Users",
      KeySchema: [
        { AttributeName: "regdId", KeyType: "HASH" },
      ],
      AttributeDefinitions: [
        { AttributeName: "regdId", AttributeType: "S" },
        { AttributeName: "email", AttributeType: "S" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "email-index",
          KeySchema: [
            { AttributeName: "email", KeyType: "HASH" },
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      TableName: "Subjects",
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
      ],
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "owner", AttributeType: "S" },
        { AttributeName: "semester", AttributeType: "S" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "owner-index",
          KeySchema: [
            { AttributeName: "owner", KeyType: "HASH" },
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        },
        {
          IndexName: "owner-semester-index",
          KeySchema: [
            { AttributeName: "owner", KeyType: "HASH" },
            { AttributeName: "semester", KeyType: "RANGE" }
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      TableName: "Attendances",
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
      ],
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "attendanceOf", AttributeType: "S" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "subject-index",
          KeySchema: [
            { AttributeName: "attendanceOf", KeyType: "HASH" },
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ];

  for (const table of tables) {
    try {
      await dynamoDB.createTable(table).promise();
      console.log(`Table ${table.TableName} created successfully.`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table ${table.TableName} already exists.`);
      } else {
        console.error(`Error creating table ${table.TableName}:`, error);
      }
    }
  }
};

module.exports = { createTables };

const AWS = require('aws-sdk');
const { fetchSecrets, configureAWS } = require('../config');

const bucketName = '5411-termproject';
let s3
let secrets;

const initializeAWS = async () => {
  secrets = await fetchSecrets();
  configureAWS(secrets);
  s3 = new AWS.S3();
};

const svgFile = async () => {
  try {
    if (!s3) {
      await initializeAWS();
    }
    const listParams = {
      Bucket: bucketName,
      Prefix: 'assets/svg/', 
    };
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    

    // Ensure there are SVG files in the bucket
    if (listedObjects.Contents.length === 0) {
      throw new Error("No SVG files found in the specified S3 bucket and prefix");
    }

    // Select a random SVG file
    const length = listedObjects.Contents.length;
    const randomIndex = Math.floor(Math.random() * length);
    const randomKey = listedObjects.Contents[randomIndex].Key;


    // Get the content of the selected SVG file
    const getParams = {
      Bucket: bucketName,
      Key: randomKey,
    };
    const svgData = await s3.getObject(getParams).promise();

    return svgData.Body;
  } catch (error) {
    console.error("Error fetching SVG from S3:", error);
    throw new Error("Failed to fetch SVG from S3");
  }
};

module.exports = svgFile;

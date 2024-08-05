const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const bucketName = 'your-s3-bucket-name';

const svgFile = async () => {
  try {
    // List objects in the S3 bucket
    const listParams = {
      Bucket:  process.env.S3_BUCKET_NAME,
      Prefix: 'assets/svg/', 
    };
    const listedObjects = await s3.listObjectsV2(listParams).promise();

    // Select a random SVG file
    const length = listedObjects.Contents.length;
    const randomIndex = Math.floor(Math.random() * length);
    const randomKey = listedObjects.Contents[randomIndex].Key;

    // Get the content of the selected SVG file
    const getParams = {
      Bucket: process.env.S3_BUCKET_NAME,
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

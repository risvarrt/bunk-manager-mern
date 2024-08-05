const AWS = require('aws-sdk');
const axios = require('axios');

const fetchSecrets = async () => {
  try {
    const response = await axios.get('https://4xsepcx35b.execute-api.us-east-1.amazonaws.com/dev/secrets');
    const secrets = JSON.parse(response.data.body);

    return {
      JWTKEY: secrets.JWTKEY,
      AWS_REGION: secrets.AWS_REGION,
      AWS_ACCESS_KEY_ID: secrets.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: secrets.AWS_SECRET_ACCESS_KEY,
      AWS_SESSION_TOKEN: secrets.AWS_SESSION_TOKEN,
      S3_BUCKET_NAME: secrets.S3_BUCKET_NAME,
    };
  } catch (error) {
    console.error('Error fetching secrets:', error);
    throw error;
  }
};

const configureAWS = (secrets) => {
  AWS.config.update({
    region: secrets.AWS_REGION,
    accessKeyId: secrets.AWS_ACCESS_KEY_ID,
    secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    sessionToken: secrets.AWS_SESSION_TOKEN,
  });
};
const dbconfig =()=>{
  configureAWS(fetchSecrets());
}
module.exports = {
  fetchSecrets,
  configureAWS,
  dbconfig
};

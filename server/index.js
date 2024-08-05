require('dotenv').config();
const express = require("express");
const EventEmitter = require("events");
const path = require("path");
const AWS = require('aws-sdk');
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const bodyParser = require('body-parser');
const s3 = new AWS.S3();
const { fetchSecrets, configureAWS } = require('./config');
const { createTables } = require("./db/dynamo");

const userModel = require('./models/user');
const subjectModel = require('./models/subject');
const attendanceModel = require('./models/attendance');

const userRoutes = require("./routers/user");
const subjectRoutes = require("./routers/subject");
const attendanceRoutes = require("./routers/attendance");

const app = express();

// Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again after an hour!",
});
app.use("/", limiter);

app.use(express.json());
app.use(xss());

const emitter = new EventEmitter();
emitter.setMaxListeners(20);
app.use(cors());

app.use(userRoutes);
app.use(subjectRoutes);
app.use(attendanceRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

// Initialize and start the app
const initializeApp = async () => {
  try {
    const secrets = await fetchSecrets();

    // Configure AWS SDK with retrieved secrets
    configureAWS(secrets);

    const docClient = new AWS.DynamoDB.DocumentClient();
    // Initialize models with AWS services
    userModel.init({ docClient });
    subjectModel.init({ docClient });
    attendanceModel.init({ docClient });

    // Your application setup (middlewares, routes, etc.)
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // Create DynamoDB tables on startup
    await createTables();

    // Define routes
    app.use(userRoutes);
    app.use(subjectRoutes);
    app.use(attendanceRoutes);

    // Start the server
    const PORT =  5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Error during app initialization:', err);
    process.exit(1); // Exit the process with an error code
  }
};

initializeApp();

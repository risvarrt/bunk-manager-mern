require('dotenv').config();

const express = require("express");
const EventEmitter = require("events");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { createTables } = require("./db/dynamo");

const userRoutes = require("./routers/user");
const subjectRoutes = require("./routers/subject");
const attendanceRoutes = require("./routers/attendance");

const app = express();

// Set security HTTP headers
// app.use(helmet({
//   contentSecurityPolicy: {
//     scriptSrc:["'self'", "https://salty-brook-29410.herokuapp.com/"],
//   }
// }));

// Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again after an hour!",
});
app.use("/", limiter);

app.use(express.json());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Event emitter increased
const emitter = new EventEmitter();
emitter.setMaxListeners(20);
app.use(cors());

// Routers
app.use(userRoutes);
app.use(subjectRoutes);
app.use(attendanceRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Create DynamoDB tables on startup
createTables().then(() => {
  console.log('Tables checked/created successfully.');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`APP IS RUNNING ON PORT ${PORT}`);
  });
}).catch((error) => {
  console.error('Error checking/creating tables:', error);
  process.exit(1); // Exit the process if tables creation fails
});

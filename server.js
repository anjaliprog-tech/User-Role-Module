const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const routes = require("./routes/index.route");
const connectDB = require("./models");
const http = require("http");
const cors = require("cors");
dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// To add custom params into the response header.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Accept, Authorization, Authorization"
  );

  res.header("Access-Control-Expose-Headers", "Authorization");
  next();
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

const appListener = (err, res) => {
  if (err) {
    console.error(err);
  } else {
    connectDB();
    console.log(`App listening to PORT: ${PORT}... `);
  }
};
// Create a HTTP server
const server = http.createServer(app);
server.listen(PORT, appListener);

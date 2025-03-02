var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("hbs"); // Use `hbs` instead of `express-hbs`
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
const logoutRoutes = require('./routes/logout');
const MongoStore = require('connect-mongo');
dotenv.config();
require("./passport");

const sessionKey = process.env.SESSION_SECRET; // FIXED: Correct env variable name

// ✅ Ensure MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not set in .env file");
  process.exit(1);
}

// ✅ Connect to MongoDB only once
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected to Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Ensure SESSION_SECRET exists
if (!sessionKey) {
  console.error("❌ ERROR: SESSION_SECRET is not set in .env file");
  process.exit(1);
}

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/login");
var collabRouter = require("./routes/task");
global.User = require("./models/user");
global.Task = require("./models/task");
var app = express();

// ✅ Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/partials")); // ✅ Register partials
app.use('/logout', logoutRoutes);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Fix session middleware
app.use(
  session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ User authentication middleware
app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

// ✅ Routes
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", collabRouter);
app.use("/users", usersRouter);
// const session = require('express-session');

app.use(session({
  secret: 'f5ce815eb1e1af331f853586be94194f3e8482be02696f419ef8f1034d5c14920483c47e0df78bb72454e424bcbe22807b1125f9a9b19b4b5342410657b4cf61', // Change this to a strong secret
  resave: false, // ✅ Prevent unnecessary resaving
  saveUninitialized: false, // ✅ Do not store empty sessions
  store: MongoStore.create({
      mongoUrl: 'mongodb://agarwalprateek666:qGOR1FPQHnwrFUD9@codingpltform-shard-00-00.llqnz.mongodb.net:27017,codingpltform-shard-00-01.llqnz.mongodb.net:27017,codingpltform-shard-00-02.llqnz.mongodb.net:27017/?authSource=admin&replicaSet=atlas-b9k7l7-shard-0&retryWrites=true&w=majority&ssl=true',
      collectionName: 'sessions'
  }),
  cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true
  }
}));

// ✅ 404 error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// ✅ Global error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

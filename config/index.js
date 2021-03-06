const express = require("express");
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost/module-2-project";

const logger = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const path = require("path");
const MongoStore = require("connect-mongo");
const User = require("../models/User.model");

module.exports = (app) => {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "hbs");
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "super hyper secret key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: MONGO_URI,
      }),
    })
  );

  app.use((req, res, next) => {
    if (req.session.user) {
      User.findById(req.session.user._id).then((user) => {
        req.app.locals.globalUser = user;
        req.app.locals.fullUrl = req.protocol + "://" + req.get("host");
        next();
      });
    } else {
      next();
    }
  });

  app.use(
    favicon(path.join(__dirname, "..", "public", "images", "favicon.ico"))
  );
};

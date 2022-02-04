const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const isLoggedIn = require("../middleware/isLoggedIn");

const saltRounds = 10;

router.get("/edit", isLoggedIn, (req, res, next) => {
  res.render("user/edit");
});

router.post("/edit", isLoggedIn, (req, res, next) => {
  function ValidateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  }
  let username = req.session.user.username;
  const email = req.body.email;

  if (!email) {
    return res.status(400).render("user/edit", {
      errorMessage: "Please provide an Email.",
    });
  }

  if (!ValidateEmail(email)) {
    return res.status(400).render("user/edit", {
      errorMessage: "Please provide a valid Email.",
    });
  }

  User.findOneAndUpdate(
    { username },
    { email: email },
    {
      returnOriginal: false,
    }
  )
    .then((found) => {
      req.session.user = found;
      req.app.locals.globalUser = found;
      return res.status(200).render("user/edit", {
        successMessage: "Info updated Succesfully",
      });
    })
    .catch((error) => {});
});

router.get("/change-my-password", isLoggedIn, (req, res, next) => {
  res.render("user/change-my-password", req.session.user);
});

router.post("/change-my-password", isLoggedIn, (req, res, next) => {
  let username = req.session.user.username;
  const { oldPassword, newPassword } = req.body;

  if (newPassword.length < 8) {
    return res.status(400).render("user/change-my-password", {
      errorMessage: "Your New password needs to be at least 8 characters long.",
    });
  }

  return bcrypt
    .compare(oldPassword, req.session.user.password)
    .then((isSamePassword) => {
      if (!isSamePassword) {
        return res.status(400).render("user/change-my-password", {
          errorMessage: "Wrong credentials.",
        });
      }

      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(newPassword, salt))
        .then((hashedPassword) => {
          return User.findOneAndUpdate(
            { username },
            { password: hashedPassword },
            {
              returnOriginal: false,
            }
          )
            .then((found) => {
              req.session.user = found;
              req.app.locals.globalUser = found;
              return res.status(200).render("user/change-my-password", {
                successMessage: "Password Changed Succesfully",
              });
            })

            .catch((error) => {
              if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).render("user/change-my-password", {
                  errorMessage: error.message,
                });
              }
              if (error.code === 11000) {
                return res.status(400).render("user/change-my-password", {
                  errorMessage:
                    "Username need to be unique. The username you chose is already in use.",
                });
              }
              return res.status(500).render("user/change-my-password", {
                errorMessage: error.message,
              });
            });
        });
    });
});

router.get("/", isLoggedIn, (req, res, next) => {
  res.redirect("urls");
});

router.get("/urls", isLoggedIn, (req, res, next) => {
  User.findById(req.session.user._id)
    .populate("urls")

    .then((data) => {
      res.render("user/urls", data);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/create-url", isLoggedIn, (req, res, next) => {
  res.render("user/create-url");
});

module.exports = router;

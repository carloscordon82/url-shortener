const router = require("express").Router();
const User = require("../models/User.model");
const Url = require("../models/Url.model");
const isLoggedIn = require("../middleware/isLoggedIn");

function randomString() {
  let length = 5;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

router.get("/create-url", isLoggedIn, (req, res, next) => {
  res.render("urls/create-url");
});

router.post("/create-url", isLoggedIn, (req, res, next) => {
  function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  if (!req.body.shortLink) {
    req.body.shortLink = randomString();
  }

  if (isValidHttpUrl(req.body.destinationLink)) {
    Url.findOne({ shortLink: req.body.shortLink }).then((found) => {
      if (found) {
        return res.status(400).render("urls/create-url", {
          errorMessage: "Short URL already exists",
        });
      } else {
        Url.create(req.body)
          .then((newUrl) => {
            User.findByIdAndUpdate(
              req.session.user._id,
              {
                $push: { urls: newUrl._id },
              },
              { new: true }
            )
              .then((updatedUser) => {
                req.session.user = updatedUser;
                res.redirect("/user/urls");
              })
              .catch((error) => {
                next(err);
              });
          })
          .catch((error) => {
            next(err);
          });
      }
    });
  } else {
    return res.status(400).render("urls/create-url", {
      errorMessage: "Please provide a valid URL",
    });
  }
});

router.get("/edit-url/:urlId", isLoggedIn, (req, res, next) => {
  Url.findById(req.params.urlId).then((urlFound) => {
    res.render("urls/edit-url", urlFound);
  });
});

router.post("/edit-url/:urlId", isLoggedIn, (req, res, next) => {
  function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  if (!req.body.shortLink) {
    req.body.shortLink = randomString();
  }
  Url.findById(req.params.urlId).then((urlFound) => {
    if (isValidHttpUrl(req.body.destinationLink)) {
      Url.findOne({ shortLink: req.body.shortLink }).then((found) => {
        if (found) {
          if (found._id != req.params.urlId) {
            urlFound.errorMessage = "Short URL already exists";
            return res.status(400).render("urls/edit-url", urlFound);
          }
        }

        Url.updateOne({ _id: req.params.urlId }, req.body)
          .then((newUrl) => {
            res.redirect("/user/urls");
          })

          .catch((error) => {
            next(err);
          });
      });
    } else {
      urlFound.errorMessage = "Please provide a valid URL";
      return res.status(400).render("urls/edit-url", urlFound);
    }
  });
});

router.get("/delete-url/:urlId", isLoggedIn, (req, res, next) => {
  User.updateOne(
    { username: req.session.user.username },
    {
      $pullAll: {
        urls: [req.params.urlId],
      },
    }
  )
    .then((result) => {
      Url.findByIdAndDelete(req.params.urlId)
        .then((deletedUrl) => {
          res.redirect("/user/urls");
        })
        .catch((error) => {
          next(err);
        });
    })
    .catch((error) => {
      next(err);
    });
});

module.exports = router;

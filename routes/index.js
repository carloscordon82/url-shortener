const router = require("express").Router();
const Url = require("../models/Url.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, (req, res, next) => {
  res.redirect("user/urls");
});

router.get("/:shortLink", (req, res, next) => {
  Url.findOne({ shortLink: req.params.shortLink }).then((found) => {
    if (found) {
      found.clicks++;
      Url.findByIdAndUpdate(found._id, { clicks: found.clicks }).then(() => {
        res.redirect(found.destinationLink);
      });
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;

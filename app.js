require("dotenv/config");
require("./db");
const express = require("express");
const hbs = require("hbs");
const app = express();
require("./config")(app);

const index = require("./routes/index");
const auth = require("./routes/auth.routes");
const user = require("./routes/user.routes");
const urls = require("./routes/urls.routes");
app.use("/", auth);
app.use("/", index);

app.use("/user", user);
app.use("/urls", urls);

require("./error-handling")(app);

module.exports = app;

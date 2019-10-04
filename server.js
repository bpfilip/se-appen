require("dotenv").config();
const fs = require("fs");

const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json())
app.use(cookieParser());

// Logger
// if (process.env.logger == "true") {
//     app.use(require("./logger"));
// }

// app.use((req, res, next) => {
//     console.log(req)
//     return next();
// })

// Auth
app.use(require("./routes/auth"));

// APIs
app.use("/users", require("./routes/users"));
app.use("/state", require("./routes/state"));
app.use("/admin", require("./routes/admin"));

// static content
app.use("/", express.static("public"));

app.use("/private", (req, res, next) => {
    if (req.token) return next();
    return res.redirect(302, "/");
})

app.use("/private/admin", (req, res, next) => {
    if (req.user.admin !== true) return res.redirect(302, "/private/");
    return next();
})

app.use("/private", express.static("private"));

app.listen(process.env.port, () => {
    console.log(`Listening on port ${process.env.port}`)
})
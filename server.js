require("dotenv").config();
const fs = require("fs");

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users");

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
app.use("/subscribe", require("./routes/subscribe"));

// static content
app.use("/", express.static("public"));

app.use("/private", (req, res, next) => {
    if (req.token) return next();
    return res.redirect(302, "/");
})

app.use("/private/admin", async (req, res, next) => {
    let user = await Users.findOne({ username: req.user.username });
    if (!user.admin) return res.redirect(302, "/private/");
    return next();
})

app.use("/private", express.static("private"));

app.listen(process.env.port, () => {
    console.log(`Listening on port ${process.env.port}`)
})
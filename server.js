require("dotenv").config();
const fs = require("fs");

const { Users } = require("./db");

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
app.use("/rooms", require("./routes/rooms"));
app.use("/admin", require("./routes/admin"));
app.use("/subscribe", require("./routes/subscribe"));
app.use("/checked", require("./routes/checked"));
app.use("/events", require("./routes/events"));

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
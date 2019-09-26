require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
// const csp = require('helmet-csp')
// const cors = require("cors");

const app = express();

app.use(express.json())
app.use(cookieParser());

// Logger
// app.use(require("./logger"));

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
    return res.redirect("/", 302);
})

app.use("/private", express.static("private"));


app.listen(process.env.port, () => console.log("Listening on port 8080"));
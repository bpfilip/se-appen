require("dotenv").config();
const fs = require("fs");

const https = require('https');
const http = require('http');
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


// app.listen(process.env.port, () => console.log("Listening on port "+process.env.port));

https.createServer({
    key: fs.readFileSync(process.env.key, { encoding: "UTF8" }),
    cert: fs.readFileSync(process.env.cert, { encoding: "UTF8" })
}, app)
    .listen(process.env.httpsport, () => {
        console.log(`Listening on port ${process.env.httpsport}`)
    })

http.createServer(app)
    .listen(process.env.httpport, () => {
        console.log(`Listening on port ${process.env.httpport}`)
    })
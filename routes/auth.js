const express = require("express");
const Router = express.Router();

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtkey;;

const bcrypt = require("bcrypt");

const { Users, Rooms, Unverified, Ips } = require("../db");
const Notifications = require("../notifications");

const Email = require("../email/email");

Router.post("/register", async (req, res, next) => {
    if (!("name" in req.body)) return res.status(400).send("A name was not sent");
    if (!("username" in req.body)) return res.status(400).send("A username was not sent");
    if (!("password" in req.body)) return res.status(400).send("A password was not sent");
    if (!("email" in req.body)) return res.status(400).send("An email was not sent");
    if (!("roomNmb" in req.body)) return res.status(400).send("A room number was not sent");

    req.body.roomNmb = parseInt(req.body.roomNmb);

    if (!/^[a-zA-ZÆØÅæøå]+(([',. -][a-zA-ZÆØÅæøå])?[a-zA-ZÆØÅæøå]*)*$/.test(req.body.name)) return res.status(400).send("Invalid name");
    if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        .test(req.body.email)) return res.status(400).send("Invalid email");
    if (isNaN(req.body.roomNmb)) return res.status(400).send("roomNmb is not a number");

    let email = await Users.findOne({ email: req.body.email });
    if (email) return res.status(400).send("Email already in use");

    let room = await Rooms.findOne({ number: req.body.roomNmb });
    if (!room) return res.status(400).send("Room does not exist");

    const sameName = await Users.findOne({ name: req.body.name })
    if (sameName) return res.status(400).send("A user with that name alredy exists");

    req.body.username = req.body.username.toLowerCase();
    req.body.username = req.body.username.trim();

    const sameUsername = await Users.findOne({ username: req.body.username })
    if (sameUsername) return res.status(400).send("A user with that username alredy exists");

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) return res.status(500).send(err);

        Unverified.insert({ username: req.body.username, name: req.body.name, password: hash, roomNmb: req.body.roomNmb, room: room._id, email: req.body.email, verified: false, mailVerified: false, admin: false });

        let user = await Unverified.findOne({ username: req.body.username })

        // Email.sendVerification(user).catch(console.error);

        Notifications.newUser(user);

        return res.send({ status: "succes" });
    });

})

Router.post("/login", async (req, res, next) => {
    if (!("username" in req.body)) return res.status(400).send("A username was not sent");
    if (!("password" in req.body)) return res.status(400).send("A password was not sent");

    req.body.username = req.body.username.toLowerCase();
    req.body.username = req.body.username.trim();

    const users = await Users.find({ username: req.body.username });

    if (users.length < 1) return res.status(401).send("The username or password was incorret");

    const user = users[0];

    bcrypt.compare(req.body.password, user.password, function (err, corret) {
        if (err) return res.status(500).send(err);
        if (corret) {

            if (!user.verified) return res.status(403).send("The user has not been verified yet");

            const token = jwt.sign({ data: { name: user.name, username: req.body.username, roomNmb: req.body.roomNmb } }, jwtSecret)
            return res.send({ status: "succes", token });
        }

        return res.status(401).send("The username or password was incorret")
    });
})

Router.post("/token", async (req, res, next) => {

    //comming soon
    return res.sendStatus(501)

    if (!("token" in req.body)) return res.status(400).send("A token was not sent");

    const user = await Users.findOne({ token: req.body.token });
})

Router.get("/verify", async (req, res, next) => {
    if (!("token" in req.query)) return res.status(400).send("A token was not sent");

    const token = req.query.token;

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) return res.status(400).send("Invalid token");

        user = decoded.data;

        res = res.status(200).send(`<p>Token verified</p><p>Return to <a href="/">homepage</a></p>`);

        Users.update({ ...user }, { $set: { mailVerified: true } });

        return res;
    });
})

Router.use((req, res, next) => {

    if ("authorization" in req.headers) {
        const token = req.headers.authorization.split("Bearer ")[1]
        return jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return next();

            // Valid token
            req.token = token;
            req.user = decoded.data;

            return next();
        });
    }

    if (req.cookies.token) {
        const token = req.cookies.token;
        return jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return next();

            // Valid token
            req.token = token;
            req.user = decoded.data;

            // res.send(req.token)

            return next();
        });
    }

    return next();
})

module.exports = Router;
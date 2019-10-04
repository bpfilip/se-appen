const express = require("express");
const Router = express.Router();

const bcrypt = require("bcrypt");

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users")

Router.get("/me", async (req, res, next) => {
    if (!req.token) return res.sendStatus(403);

    let user = await Users.findOne({ username: req.user.username });

    return res.send({ name: user.name, username: user.username, admin: user.admin, roomNmb: user.roomNmb });
})

Router.post("/change/password", async (req, res, next) => {
    if (!req.token) return res.sendStatus(403);
    if (!("current" in req.body)) return res.status(400).send("The current password was not sent");
    if (!("new" in req.body)) return res.status(400).send("The new password was not sent");

    if (req.body.new == req.body.current) return res.status(400).send("The new and old password can not be the same");

    console.log(req.body)

    let user = await Users.findOne({ username: req.user.username });

    if (!user) return res.sendStatus(500);

    bcrypt.compare(req.body.current, user.password, function (err, corret) {
        if (err) return res.status(500).send(err);
        console.log(corret)
        if (corret) {

            bcrypt.hash(req.body.new, 10, async (err, hash) => {
                if (err) return res.status(500).send(err);

                Users.update({ username: user.username }, { $set: { password: hash } })
                return res.send({ status: "succes" });
            });
        } else {
            return res.status(401).send("The password was incorret")
        }
    });
})

module.exports = Router;
const express = require("express");
const Router = express.Router();

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users")

const UNKNOWN = 0;
const CHECKED = 1;
const NOTCHECKED = 2;

Router.post("/", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    if (!("state" in req.body)) return res.status(400).send("A state was not provided");

    if (!/^[0-2]$/.test(req.body.state)) return res.status(400).send("Invalid state");
    
    Users.update({ name: req.user.name }, { $set: { state: req.body.state } })
    res.send({ status: "succes", state: req.body.state });
})

module.exports = Router;
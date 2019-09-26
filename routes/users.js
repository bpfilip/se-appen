const express = require("express");
const Router = express.Router();

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users")

Router.get("/me", async (req, res, next) => {
    if (!req.token) return res.sendStatus(403);

    // return res.send(JSON.stringify(req.user))

    let user = await Users.findOne({username: req.user.username});

    return res.send({name: user.name, username: user.username, admin: user.admin, roomNmb: user.roomNmb});
})

module.exports = Router;
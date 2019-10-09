const express = require("express");
const Router = express.Router();

const { Rooms, Events, Users } = require("../db");

Router.post("/", async (req, res) => {
    if (!req.token) return res.sendStatus(403);

    let user = await Users.findOne({ username: req.user.username })

    let room = await Rooms.findOne({ number: user.roomNmb })

    if (room.checked) return res.send({status: "Already checked"})

    Events.insert({ action: "checked", room: user.room, user: user._id, createdAt: new Date().getTime() });

    Rooms.update({ _id: user.room }, { $set: { checked: true } });

    return res.send({ status: "succes" })
})

module.exports = Router;
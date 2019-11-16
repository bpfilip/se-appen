const express = require("express");
const Router = express.Router();

const { Rooms, Events, Users } = require("../db");
const Notifications = require("../notifications");

const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });

const redis = require("redis");
const client = redis.createClient();

Router.post("/", async (req, res) => {
    if (!req.token) return res.sendStatus(403);

    let user = await Users.findOne({ username: req.user.username })

    let room = await Rooms.findOne({ number: user.roomNmb })

    if (room.checked) {

        Events.insert({ action: "checked", again: true, room: user.room, user: user._id, createdAt: new Date().getTime() });

        res.send({ status: "Already checked" })

        io.emit("checked");

        // Notifications.checked(user, room);
        return;
    }

    Events.insert({ action: "checked", room: user.room, user: user._id, createdAt: new Date().getTime() });

    Rooms.update({ _id: user.room }, { $set: { checked: true } });

    io.emit("checked");

    // Notifications.checked(user, room);
    client.publish("notifications", JSON.stringify({user: user._id, room: room._id}));

    return res.send({ status: "succes" })
})

module.exports = Router;
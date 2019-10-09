const express = require("express");
const Router = express.Router();

const bcrypt = require("bcrypt");

const { Users, Rooms } = require("../db");

Router.get("/", async (req, res) => {
    if (!req.token) return res.sendStatus(403);

    let rooms = await Rooms.find({});

    for (let i = 0; i < rooms.length; i++) {
        let room = { ...rooms[i], _id: undefined };
        rooms[i] = room;
        for (let k = 0; k < room.users.length; k++) {
            let userId = room.users[k];
            let user = await Users.findOne({ _id: userId })
            room.users[k] = { name: user.name }
        }
    }

    return res.send({ ...rooms });
})

Router.get("/:number", async (req, res) => {
    if (!req.token) return res.sendStatus(403);

    let rooms = [await Rooms.findOne({ number: parseInt(req.params.number) })];

    for (let i = 0; i < rooms.length; i++) {
        let room = { ...rooms[i], _id: undefined };
        rooms[i] = room;
        for (let k = 0; k < room.users.length; k++) {
            let userId = room.users[k];
            let user = await Users.findOne({ _id: userId })
            room.users[k] = { name: user.name }
        }
    }

    return res.send({ ...rooms[0], _id: undefined });
})

module.exports = Router;
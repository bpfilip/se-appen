const express = require("express");
const Router = express.Router();

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users");
const Rooms = monk.get("rooms");

Router.post("/create/rooms", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ name: req.user.name })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    let newRooms = req.body;
    
    newRooms = newRooms.map(room => {
        return { number: room.number, users: [], status: 0, event: [] }
    })

    Rooms.insert(newRooms);
    res.send(newRooms);
});

module.exports = Router;
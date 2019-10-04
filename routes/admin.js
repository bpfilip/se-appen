const express = require("express");
const Router = express.Router();

const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users");
const Rooms = monk.get("rooms");

Router.post("/create/rooms", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    let newRooms = req.body;

    newRooms = newRooms.map(room => {
        return { number: room.number, users: [], status: 0, events: [] }
    })

    Rooms.insert(newRooms);
    res.send(newRooms);
});

Router.post("/verify", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    if (!("username" in req.body)) return res.status(400).send("A username was not sent");

    let user = await Users.findOne({ username: req.body.username });

    if (!user) return res.status(400).send("That user doesn't exist");
    if (user.verified) return res.status(400).send("That user is already verified");

    Users.update({ username: user.username }, { $set: { verified: true } });
})

Router.post("/unverify", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    if (!("username" in req.body)) return res.status(400).send("A username was not sent");

    let user = await Users.findOne({ username: req.body.username });

    if (!user) return res.status(400).send("That user doesn't exist");

    Users.remove({ username: user.username });
})

Router.get("/users/unverified", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    const users = await Users.find({ verified: false });

    res.send({ ...users, password: undefined })
})

module.exports = Router;
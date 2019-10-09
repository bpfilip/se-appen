const express = require("express");
const Router = express.Router();

const { Users, Rooms, Unverified } = require("../db");

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

    let verifiedUser = await Users.findOne({ username: req.body.username });
    if (verifiedUser) return res.status(400).send("That user is already verified");

    let user = await Unverified.findOne({ username: req.body.username });

    Unverified.remove({ ...user });

    Users.insert({ ...user, verified: true });

    let room = await Rooms.findOne({ number: user.roomNmb })

    console.log(room)

    let users = room.users;
    users.push(user._id)
    Rooms.update({ _id: room._id }, { $set: { users } })

    return res.send({ status: "succes" })
})

Router.post("/unverify", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    if (!("username" in req.body)) return res.status(400).send("A username was not sent");

    let user = await Users.findOne({ username: req.body.username });

    if (!user) return res.status(400).send("That user doesn't exist");

    const room = await Rooms.findOne({ number: user.roomNmb });

    Unverified.remove({ username: user.username });

    return res.send({ status: "succes" })
})

Router.get("/users/unverified", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    const users = await Unverified.find({});

    res.send({ ...users, password: undefined })
})

Router.get("/rooms", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    const rooms = await Rooms.find({});

    console.log(rooms)

    res.send(rooms)
})

Router.post("/rooms/create", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    if (!("number" in req.body)) return res.status(400).send("A number was not sent");

    Rooms.insert({ number: parseInt(req.body.number), users: [], state: 0, checked: false })
})

Router.post("/clear", async (req, res) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    let rooms = await Rooms.find({});

    console.log(rooms)

    rooms.forEach(room => {
        Rooms.update({ _id: room._id }, { $set: { checked: false } });
    });

    return res.send({ status: "succes" });
})

module.exports = Router;
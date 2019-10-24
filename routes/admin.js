const express = require("express");
const Router = express.Router();

const { Users, Rooms, Unverified, Events, ClearTimes } = require("../db");

const redis = require("redis");
const client = redis.createClient();

// Auth

Router.use(async (req, res, next) => {
    if (!req.token) return res.sendStatus(403);
    let adminUser = await Users.findOne({ username: req.user.username })

    if (!adminUser.admin) return res.status(403).send("Insufficient permission");

    return next();
})

// ##############

Router.post("/create/rooms", async (req, res) => {
    let newRooms = req.body;

    newRooms = newRooms.map(room => {
        return { number: room.number, users: [], status: 0, events: [] }
    })

    Rooms.insert(newRooms);
    res.send(newRooms);
});

Router.post("/verify", async (req, res) => {
    if (!("username" in req.body)) return res.status(400).send("A username was not sent");

    let verifiedUser = await Users.findOne({ username: req.body.username });
    if (verifiedUser) return res.status(400).send("That user is already verified");

    let user = await Unverified.findOne({ username: req.body.username });

    Unverified.remove({ ...user });

    Users.insert({ ...user, verified: true });

    let room = await Rooms.findOne({ number: user.roomNmb })

    let users = room.users;
    users.push(user._id)
    Rooms.update({ _id: room._id }, { $set: { users } })

    return res.send({ status: "succes" })
})

Router.post("/unverify", async (req, res) => {
    if (!("username" in req.body)) return res.status(400).send("A username was not sent");

    let user = await Unverified.findOne({ username: req.body.username });

    if (!user) return res.status(400).send("That user doesn't exist");

    Unverified.remove({ username: user.username });

    return res.send({ status: "succes" })
})

Router.get("/users/unverified", async (req, res) => {
    const users = await Unverified.find({});

    res.send({ ...users, password: undefined })
})

Router.get("/users/unverified/count", async (req, res) => {
    const users = await Unverified.find({});

    res.send({ count: users.length })
})

Router.get("/rooms", async (req, res) => {
    const rooms = await Rooms.find({}, { sort: { number: 1 } });

    res.send(rooms)
})

Router.post("/rooms/create", async (req, res) => {
    if (!("number" in req.body)) return res.status(400).send("A number was not sent");

    if (isNaN(req.body.number)) return res.status(400).send("Invalid number");

    req.body.number = parseInt(req.body.number);

    let sameRoom = await Rooms.findOne({ number: req.body.number })
    if (sameRoom) return res.status(400).send("A room with that number already exists");

    Rooms.insert({ number: parseInt(req.body.number), users: [], state: 0, checked: false });

    return res.send({ status: "succes" })
})

Router.post("/clear", async (req, res) => {
    let rooms = await Rooms.find({});

    rooms.forEach(room => {
        Rooms.update({ _id: room._id }, { $set: { checked: false } });
    });

    let user = await Users.findOne({ username: req.user.username })

    Events.insert({ action: "clear", user: user._id, createdAt: new Date().getTime() })

    return res.send({ status: "succes" });
})

Router.get("/cleartimes", async (req, res) => {
    let clearTimes = await ClearTimes.find({});

    return res.send(clearTimes);
})

Router.get("/cleartimes/onetime", async (req, res) => {
    let clearTimes = await ClearTimes.find({ oneTime: true });

    return res.send(clearTimes);
})

Router.post("/cleartimes/add", async (req, res) => {
    if (!("days" in req.body)) return res.status(400).send("No days was sent");
    if (!("time" in req.body)) return res.status(400).send("A time was not sent");

    let oneTime = false;
    if ("oneTime" in req.body) {
        if (req.body.oneTime == true) oneTime = true;
    }

    let time = req.body.time.map(t => parseInt(t));

    await ClearTimes.insert({ days: req.body.days, time, oneTime, enabled: true });

    client.publish("settings", JSON.stringify({ type: "cleartimes-change" }))

    return res.send({ status: "succes" });
})

Router.put("/cleartimes/change/:id", async (req, res) => {
    let time = await ClearTimes.findOne({ _id: req.params.id });

    await ClearTimes.update({ _id: req.params.id }, { $set: { enabled: !time.enabled } });

    client.publish("settings", JSON.stringify({ type: "cleartimes-change" }))

    return res.send({ status: "succes" });
})

Router.delete("/cleartimes/:id", async (req, res) => {
    await ClearTimes.remove({ _id: req.params.id });

    client.publish("settings", JSON.stringify({ type: "cleartimes-change" }))

    return res.send({ status: "succes" });
})

module.exports = Router;
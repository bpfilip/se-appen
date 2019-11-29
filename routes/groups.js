const express = require("express");
const Router = express.Router();

const { Users, NotificationGroups, Rooms } = require("../db");

Router.use((req, res, next) => {
    if (!req.token) return res.sendStatus(403);
    return next();
});

Router.get("/", async (req, res) => {
    let user = await Users.findOne({ username: req.user.username });

    let groups = await NotificationGroups.find({ $or: [{ public: true }, { user: user._id }] });

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].rooms.length; j++) {
            groups[i].rooms[j] = (await Rooms.findOne({ _id: groups[i].rooms[j] })).number;
        }

        if (groups[i].public) {
            groups[i].enabled = false
            for (let j = 0; j < groups[i].users.length; j++) {
                if (groups[i].users[j].toString() == user._id.toString())
                    groups[i].enabled = true;
            }
        }

        groups[i] = { name: groups[i].name, rooms: groups[i].rooms, enabled: groups[i].enabled, public: groups[i].public }
    }

    return res.send(groups);
});

Router.post("/toggle", async (req, res) => {
    if (!("group" in req.body)) return res.status(400).send("A group was not sent");

    let group = await NotificationGroups.findOne({ name: req.body.group });

    if (!group) return res.status(400).send("That group was not found");

    let user = await Users.findOne({ username: req.user.username });

    if (!group.public) {
        NotificationGroups.update({ _id: group._id }, { $set: { enabled: !group.enabled } });

        return res.send({ succes: true });
    } else {
        for (let i = 0; i < group.users.length; i++) {
            if (group.users[i].toString() == user._id.toString()) {
                NotificationGroups.update({ _id: group._id }, { $pull: { users: user._id } });

                return res.send({ succes: true });
            }
        }
        NotificationGroups.update({ _id: group._id }, { $push: { users: user._id } });

        return res.send({ succes: true });
    }
});

Router.delete("/delete", async (req, res) => {
    if (!("group" in req.body)) return res.status(400).send("A group was not sent");

    let group = await NotificationGroups.findOne({ name: req.body.group });

    if (!group) return res.status(400).send("That group was not found");
    if (group.public) return res.status(400).send("That group is public");

    NotificationGroups.remove({ _id: group._id });

    return res.send({ succes: true });
});

Router.post("/create", async (req, res) => {
    if (!("name" in req.body)) return res.status(400).send("A name was not sent");
    if (!("rooms" in req.body)) return res.status(400).send("No rooms was sent");

    if (!Array.isArray(req.body.rooms)) return res.status(400).send("Invalid rooms");
    if (req.body.rooms.length < 1) return res.status(400).send("No rooms was sent");

    let rooms = req.body.rooms;

    for (let i = 0; i < rooms.length; i++) {
        if (isNaN(rooms[i])) return res.status(400).send(`Invalid room [${i}]`);
        rooms[i] = parseInt(rooms[i]);
    }

    for (let i = 0; i < rooms.length; i++) {
        let room = await Rooms.findOne({ number: rooms[i] });
        if (!room) return res.status(400).send(`Room does not exist [${i}]`);
        rooms[i] = room._id;
    }

    let user = await Users.findOne({ username: req.user.username });

    let sameName = await NotificationGroups.findOne({ name: req.body.name, $or: [{ public: true }, { user: user._id }] });

    if (sameName) return res.status(400).send("Group already exists");

    NotificationGroups.insert({ name: req.body.name, rooms, user: user._id, enabled: true });

    return res.send({ succes: true })
});

module.exports = Router;
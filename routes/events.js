const express = require("express");
const Router = express.Router();

const { Events, Users, Rooms, ClearTimes, ScheduleTimes } = require("../db");

Router.get("/", async (req, res) => {
	if (!req.token) return res.sendStatus(403);

	let clearEvents = await Events.find({ action: "clear" }, { sort: { createdAt: -1 } });

	let events = await Events.find({ action: "checked", again: { $not: { $eq: true } }, createdAt: { $gt: clearEvents[0].createdAt } }, { sort: { createdAt: -1 } });

	for (let i = 0; i < events.length; i++) {
		let room = await Rooms.findOne({ _id: events[i].room.toString() });
		let user = await Users.findOne({ _id: events[i].user.toString() });

		events[i].room = room.number;
		events[i].user = user.name;
	}

	return res.send(events)
});

Router.get("/next", async (req, res) => {
	if (!req.token) return res.sendStatus(403);

	let scheduleTimes = await ScheduleTimes.findOne({});

	return res.send(scheduleTimes.times[0] + "")
});

module.exports = Router;
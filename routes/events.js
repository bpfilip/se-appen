const express = require("express");
const Router = express.Router();

const { Events, Users, Rooms, ClearTimes } = require("../db");

Router.get("/", async (req, res) => {
	if (!req.token) return res.sendStatus(403);

	let clearEvents = await Events.find({ action: "clear" }, { sort: { createdAt: -1 } });

	let events = await Events.find({ action: "checked", createdAt: { $gt: clearEvents[0].createdAt } }, { sort: { createdAt: -1 } });

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

	let clearTimes = await ClearTimes.find({ enabled: true });

	let times = [];

	for (let i = 0; i < clearTimes.length; i++) {
		for (let j = 0; j < clearTimes[i].days.length; j++) {

			clearTimes[i].days[j] = parseInt(clearTimes[i].days[j])

			let day_in_week = clearTimes[i].days[j];

			if (clearTimes[i].time[0] < 12) day_in_week++;
			if (day_in_week > 6) day_in_week - 7;

			let ret = new Date();
			ret.setHours(clearTimes[i].time[0] - 1, clearTimes[i].time[1], 0)
			ret.setDate(ret.getDate() + (day_in_week - 1 - ret.getDay() + 7) % 7 + 1);
			// times.push(ret.getTime()-new Date().getTime())
			times.push(ret.getTime())
		}
	}

	times.sort();

	return res.send(times[0] + "")
});

module.exports = Router;
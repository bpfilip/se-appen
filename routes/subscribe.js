const express = require('express');
const router = express.Router();

const { Devices, Users } = require("../db");

const Notifications = require("../notifications");

router.post("/", async (req, res) => {
	if (!req.token) return res.sendStatus(403);
	if (!("endpoint" in req.body)) return res.status(400).send("A endpoint was not sent");
	if (!("keys" in req.body)) return res.status(400).send("Keys was not sent");
	if (!("auth" in req.body.keys)) return res.status(400).send("Auth was not sent");
	if (!("p256dh" in req.body.keys)) return res.status(400).send("p256dh was not sent");

	let subscription = req.body;
	subscription = { endpoint: subscription.endpoint, keys: subscription.keys, expirationTime: subscription.expirationTime };

	let device = await Devices.findOne({ ...subscription });
	if (device) return res.send({ status: "Already subscribed" })

	let user = await Users.findOne({ ...req.user });

	Devices.insert({ ...subscription, user: user._id });

	return res.status(200).send({ status: "succes" });
});

// router.get("/", async (req, res) => {
// 	await Notifications.send("filli1303", { title: "Test", body: "DET VIRKER!", site: "/private/" })
// 	res.send("OK")
// })

module.exports = router;
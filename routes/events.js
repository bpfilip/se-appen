const express = require("express");
const Router = express.Router();

const { Events } = require("../db");

Router.get("/", async (req, res) => {
    if (!req.token) return res.sendStatus(403);

    let events = await Events.find({})

    return res.send(events)
});

module.exports = Router;
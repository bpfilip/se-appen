const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users");
const Rooms = monk.get("rooms");
const Devices = monk.get("devices");
const Unverified = monk.get("unverified");
const Ips = monk.get("ips");
const Events = monk.get("events");

module.exports = { Users, Rooms, Devices, Unverified, Ips, Events }
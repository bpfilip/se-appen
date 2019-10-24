const monk = require("monk")("localhost/efterskole", { useUnifiedTopology: true });
const Users = monk.get("users");
const Rooms = monk.get("rooms");
const Devices = monk.get("devices");
const Unverified = monk.get("unverified");
const Ips = monk.get("ips");
const Events = monk.get("events");
const Settings = monk.get("settings");
const ClearTimes= monk.get("cleartimes");

module.exports = { Users, Rooms, Devices, Unverified, Ips, Events, Settings, ClearTimes }
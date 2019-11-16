const webpush = require("web-push");
const monk = require('monk')

const fs = require("fs");

webpush.setGCMAPIKey(fs.readFileSync("./notifications/GCM.key", { encoding: "UTF8" }));
webpush.setVapidDetails(
    'mailto:se.appens@gmail.com',
    fs.readFileSync("./notifications/public.key", { encoding: "UTF8" }),
    fs.readFileSync("./notifications/private.key", { encoding: "UTF8" })
);

const redis = require("redis");
const broadcast = redis.createClient();
const client = redis.createClient();

client.subscribe("notifications");

const { Devices, Users, NotificationGroups, Rooms } = require("./db");

const Notifications = {};

Notifications.send = async (username, payload) => {
    let user = await Users.findOne({ username });
    let devices = await Devices.find({ user: user._id });

    if (devices.length < 1) return;

    payload = { ...payload, action: "Notification" }

    devices.forEach(device => {
        webpush.sendNotification(device, JSON.stringify(payload)).catch(error => {
            Devices.remove(device)
        });
    });

    return;
}

Notifications.newUser = async (user) => {
    let admins = await Users.find({ admin: true });
    let devices = [];

    for (let i = 0; i < admins.length; i++) {
        devices = [...devices, ...await Devices.find({ user: admins[i]._id })];
    }

    if (devices.length < 1) return;

    let payload = { title: "Ny bruger", body: `${user.name} har oprettet en bruger`, site: "/private/admin/admin.html?admin=confirm-users", action: "Notification" }

    for (let i = 0; i < devices.length; i++) {
        console.log(devices[i])
        webpush.sendNotification(devices[i], JSON.stringify(payload)).catch(error => {
            Devices.remove({ _id: devices[i]._id })
        });
    }

    return;
}

Notifications.checked = async (userId, roomId) => {
    broadcast.publish("debug", JSON.stringify({ test: "a" }));

    let room = await Rooms.findOne({ _id: roomId })

    console.log(roomId)

    let notificationGroups = await NotificationGroups.find({ rooms: { $in: [room._id] } });

    for (let i = 0; i < notificationGroups.length; i++) {
        let users = [];
        if (notificationGroups[i].public) {
            users = notificationGroups[i].users;
        } else {
            users = [notificationGroups[i].user];
        }

        let devices = [];

        for (let i = 0; i < users.length; i++) {
            devices = [...devices, ...await Devices.find({ user: users[i] })];
        }

        let payload = { title: "Der er blevet tjekket på "+notificationGroups[i].name, body: `Værelse ${room.number} er lige blevet tjekket`, site: "/private/", action: "Notification", tag: Math.random() }

        for (let i = 0; i < devices.length; i++) {
            webpush.sendNotification(devices[i], JSON.stringify(payload)).catch(error => {
                Devices.remove({ _id: devices[i]._id })
            });
        }
    }

    return;
}

module.exports = Notifications;

client.on("message", (channel, data) => {
    if (channel !== "notifications") return;
    let event = JSON.parse(data);

    // console.log(event)
    Notifications.checked(event.user, event.room)
});
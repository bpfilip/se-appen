const webpush = require("web-push");

const fs = require("fs");

webpush.setGCMAPIKey(fs.readFileSync("./notifications/GCM.key", { encoding: "UTF8" }));
webpush.setVapidDetails(
    'mailto:se.appens@gmail.com',
    fs.readFileSync("./notifications/public.key", { encoding: "UTF8" }),
    fs.readFileSync("./notifications/private.key", { encoding: "UTF8" })
);

const { Devices, Users } = require("./db");

const Notifications = {};

Notifications.send = async (username, payload) => {
    let devices = await Devices.find({ username });

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
        devices.push(await Devices.findOne({ username: admins[i].username }));
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

module.exports = Notifications;
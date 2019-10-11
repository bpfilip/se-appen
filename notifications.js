const webpush = require("web-push");

const fs = require("fs");

webpush.setGCMAPIKey(fs.readFileSync("./notifications/GCM.key", { encoding: "UTF8" }));
webpush.setVapidDetails(
    'mailto:se.appens@gmail.com',
    fs.readFileSync("./notifications/public.key", { encoding: "UTF8" }),
    fs.readFileSync("./notifications/private.key", { encoding: "UTF8" })
);

const { Devices } = require("./db");

const Notifications = {};

Notifications.send = async (username, payload) => {
    let devices = await Devices.find({ username });

    if (devices.length < 1) return;

    payload = {...payload, action: "Notification"}

    devices.forEach(device => {
        webpush.sendNotification(device, JSON.stringify(payload)).catch(error => {
            Devices.remove(device)
        });
    });

    return;
}

module.exports = Notifications;
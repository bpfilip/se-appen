require("dotenv").config();
const fs = require("fs");

const { Users, Settings, ClearTimes, Rooms, Events } = require("./db");

const Schedule = require('node-schedule');

let schedules = [];

const redis = require("redis");
const client = redis.createClient();

client.subscribe("settings");

client.on("message", (channel, message) => {
    let event = JSON.parse(message);

    if (event.type == "cleartimes-change") {
        startSchedule();
    }

    console.log(event);
});

async function startSchedule() {
    schedules.forEach(event => {
        event.cancel();
    });
    schedules = [];

    let clearTimes = await ClearTimes.find({ enabled: true });

    for (let clearTime = 0; clearTime < clearTimes.length; clearTime++) {
        const data = clearTime;
        for (let day = 0; day < clearTimes[clearTime].days.length; day++) {
            let rule = new Schedule.RecurrenceRule();
            rule.dayOfWeek = clearTimes[clearTime].days[day] == 7 ? 0 : clearTimes[clearTime].days[day];
            rule.hour = clearTimes[clearTime].time[0];
            rule.minute = clearTimes[clearTime].time[1];

            let schedule = Schedule.scheduleJob(rule, async function (clearTime) {
                console.log(new Date().getTime())

                let rooms = await Rooms.find({});

                rooms.forEach(room => {
                    Rooms.update({ _id: room._id }, { $set: { checked: false } });
                });

                Events.insert({ action: "clear", auto:true, createdAt: new Date().getTime() })
            }.bind(null, data));

            schedules.push(schedule);
        }
    }
}

console.log("Cron started");

(async ()=>{
    await startSchedule();
    console.log(schedules.length + " jobs started");
})();


require("dotenv").config();
const fs = require("fs");

const { Users, Settings, ClearTimes, Rooms, Events, ScheduleTimes } = require("./db");

const Schedule = require('node-schedule');

let schedules = [];
let scheduleTimes = [];

const redis = require("redis");
const client = redis.createClient();

client.subscribe("settings");

client.on("message", (channel, message) => {
    if (channel !== "settings") return;
    let event = JSON.parse(message);

    if (event.type == "cleartimes-change") {
        startSchedule();
    }
});

async function startSchedule() {
    schedules.forEach(event => {
        event.cancel();
    });
    schedules = [];
    scheduleTimes = [];

    let clearTimes = await ClearTimes.find({ enabled: true });

    for (let clearTime = 0; clearTime < clearTimes.length; clearTime++) {
        for (let day = 0; day < clearTimes[clearTime].days.length; day++) {
            let rule = new Schedule.RecurrenceRule();
            if (clearTimes[clearTime].time[0] < 12) clearTimes[clearTime].days[day] += 1;
            rule.dayOfWeek = clearTimes[clearTime].days[day] > 6 ? clearTimes[clearTime].days[day] - 7 : clearTimes[clearTime].days[day];
            rule.hour = clearTimes[clearTime].time[0];
            rule.minute = clearTimes[clearTime].time[1];

            let schedule = Schedule.scheduleJob(rule, async function (clearTime) {

                let rooms = await Rooms.find({});

                rooms.forEach(room => {
                    Rooms.update({ _id: room._id }, { $set: { checked: false } });
                });

                Events.insert({ action: "clear", auto: true, createdAt: new Date().getTime() });

                startSchedule();
            });

            schedules.push(schedule);

            scheduleTimes.push(schedule.nextInvocation().getTime());
        }
    }

    scheduleTimes.sort();

    ScheduleTimes.update({ _id: "5db55ac75dea6848742e894e" }, { $set: { times: scheduleTimes } })
}

console.log("Cron started");

(async () => {
    await startSchedule();
    console.log(schedules.length + " jobs started");
})();
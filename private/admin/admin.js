function initialize() {
	const settingsLocation = new URL(window.location.href).searchParams.get("admin");

	const locations = ["confirm-users", "show-users", "rooms", "clear", "auto-clear"]

	if (!settingsLocation) {
		getUnverifiedCount();
		document.getElementById("root").style.display = "block";
	}

	if (!locations.includes(settingsLocation)) return;

	if (settingsLocation) {
		document.getElementById("root").style.display = "none";
		document.getElementById(settingsLocation).style.display = "block";
	}
	if (settingsLocation == "confirm-users") {
		getUnverified();
	}
	if (settingsLocation == "show-users") {
		getUsers();
	}
	if (settingsLocation == "rooms") {
		rooms();
	}
	if (settingsLocation == "clear") {
		clear();
	}
	if (settingsLocation == "auto-clear") {
		autoClear();
	}
}

async function getUnverifiedCount() {
	let res = await fetch("/admin/users/unverified/count");
	let data = await res.json();
	let count = data.count;
	if (count == 0) return;

	document.getElementById("unverified-users-count").innerText = count;
}

async function clear() {
	let res = await fetch("/admin/clear", {
		method: "POST"
	});

	setTimeout(() => {
		window.location.href = "/private/admin/admin.html"
	}, 1000)
}

// ####################################################
// #					confirm-users				  #
// ####################################################

async function getUnverified() {
	const res = await fetch("/admin/users/unverified");

	const users = await res.json()

	if (Object.keys(users).length < 1) {
		const parent = document.getElementById("confirm-users");
		parent.innerHTML = `
			<div class="user-confirm">
				<span class="name">Alle brugere er bekræftet</span>
			</div>
		`;
		return;
	}

	insertUnverified(users);
}

function insertUnverified(users) {

	const parent = document.getElementById("confirm-users");

	parent.innerHTML = "";

	for (let i in users) {
		parent.appendChild(generateUnverifiedUser(users[i]));
	}

}

function generateUnverifiedUser(user) {
	const div = document.createElement('div');
	const content = `
	<div class="user-confirm">
		<span class="name">${user.name}</span>
		<div class="allow" onclick="verify('${user.username}')">
			<img width="50" height="50" src="/private/src/images/checkmark.png">
		</div>
		<br>
		<span class="mail">${user.email}</span>
		<div class="disallow" onclick="unverify('${user.username}')">
			<img width="43" height="43" src="/private/src/images/x.png">
		</div>
		<br>
		<span class="room-title">Rum: </span><span class="room">${user.roomNmb}</span>
	</div>
	`;

	div.innerHTML = content;

	return div
}

async function verify(username) {
	const response = await fetch("/admin/verify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username
		})
	})
	getUnverified();
}

async function unverify(username) {
	const response = await fetch("/admin/unverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username
		})
	})
	getUnverified();
}

// ####################################################
// #					show-users					  #
// ####################################################

async function getUsers() {
	const res = await fetch("/users");

	const users = await res.json()

	insertUsers(users);
}

function insertUsers(users) {

	const parent = document.getElementById("show-users");

	parent.innerHTML = "";

	for (let i in users) {
		parent.appendChild(generateUser(users[i]));
	}

}

function generateUser(user) {
	const div = document.createElement('div');
	const content = `
	<div class="user">
		<span class="name">${user.name}</span>
		<br>
		<span class="mail">${user.email}</span>
		<br>
		<span class="room-title">Rum: </span><span class="room">${user.roomNmb}</span>
	</div>
	`;

	div.innerHTML = content;

	return div
}

// ####################################################
// #					rooms						  #
// ####################################################

async function rooms() {
	const res = await fetch("/rooms");

	const rooms = await res.json()

	insertRooms(rooms);
}

function insertRooms(rooms) {

	const parent = document.getElementById("rooms");

	document.getElementById("loading-rooms").style.display = "none";

	for (let i in rooms) {
		parent.appendChild(generateRoom(rooms[i]));
	}

}

function generateRoom(room) {
	let members = "";

	room.users.forEach(user => {
		members += `
			<div class="member">
				<span class="name">${user.name}</span>
			</div>
		`
	});

	const div = document.createElement('div');
	const content = `
	<div class="room">
		<span class="number">Rum: ${room.number}</span>
		<div class="member-list">
			${members}
		</div>
	</div>
	`;

	div.innerHTML = content;

	return div
}

async function newRoom(nmb) {

	if (!nmb) nmb = prompt("Hvilket nummer skal rummet have?");
	if (!nmb) alert("Indtast et rum")
	let res = await fetch("/admin/rooms/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ number: nmb })
	})

	if (res.status == 400) return alert("Det rum eksisterer allerede")

	location.reload();
}

// ####################################################
// #					auto-clear					  #
// ####################################################

async function addDay(days) {

	let oneTime = false;

	if (days === true) {
		let day = prompt("Hvilken dag skal tilføjes 'mandag: 1, tirsdag: 2 ...'");
		if (isNaN(day)) return alert("Invalid dag");
		days = [day];
		oneTime = true;
	}

	let time = prompt("Hvornår skal der cleares?", `${new Date().getHours()}:${new Date().getMinutes()}`);

	if (!time || !time.includes(":")) return alert("Invalid klokkeslæt");

	time = time.split(":");

	if (isNaN(time[0]) || isNaN(time[1])) return alert("Invalid klokkeslæt");

	let res = await fetch("/admin/cleartimes/add", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			time,
			days,
			oneTime
		})
	})

	autoClear();
}

async function autoClear() {
	let res = await fetch("/admin/cleartimes");
	let clearTimes = await res.json();

	let oneTimes = clearTimes.filter(time => time.oneTime);

	let week = clearTimes.filter(time =>
		!time.oneTime && time.days.length == 5 && time.days.includes(7) && time.days.includes(1) && time.days.includes(2) && time.days.includes(3) && time.days.includes(4)
	);

	let friday = clearTimes.filter(time =>
		!time.oneTime && time.days.length == 1 && time.days[0] == 5
	);

	let saturday = clearTimes.filter(time =>
		!time.oneTime && time.days.length == 1 && time.days[0] == 6
	);

	for (let i = 2; i < 9; i += 2) {
		document.querySelector("#auto-clear > div:nth-child(" + i + ")").innerHTML = `<div class="no-times">Ingen tider</div>`
	}

	if (week.length > 0) addTimes(document.querySelector("#auto-clear > div:nth-child(2)"), week, false);
	if (friday.length > 0) addTimes(document.querySelector("#auto-clear > div:nth-child(4)"), friday, false);
	if (saturday.length > 0) addTimes(document.querySelector("#auto-clear > div:nth-child(6)"), saturday, false);
	if (oneTimes.length > 0) addTimes(document.querySelector("#auto-clear > div:nth-child(8)"), oneTimes, false);
}

function addTimes(parent, times, isOneTime) {
	let out = "";

	const dayToText = {
		1: "Mandag",
		2: "Tirsdag",
		3: "Onsdag",
		4: "Torsdag",
		5: "Fredag",
		6: "Lørdag",
		7: "Søndag"
	}

	if (!isOneTime)
		times.forEach(time => {
			let days = "";
			time.days.forEach((day, i) => {
				days += `${dayToText[day]}`
				if (i < time.days.length - 1) days += `, `
			});
			out += `
			<div onclick="timeClick(event, this);" timeId="${time._id}">
				<span class="time">${time.time[0] < 10 ? "0" + time.time[0] : time.time[0]}:${time.time[1] < 10 ? "0" + time.time[1] : time.time[1]}</span>
				<img class="remove" src="/private/src/images/x.png">
				<input type="checkbox" ${time.enabled ? "checked" : ""} readonly onclick="this.checked = !this.checked">
				<br>
				<span class="days">${days}</span>
			</div>
		`;
		});

	parent.innerHTML = out;
}

async function toggleTime(div) {
	let res = await fetch("/admin/cleartimes/change/" + div.getAttribute("timeid"), {
		method: "PUT"
	})
}

async function deleteTime(div) {
	let res = await fetch("/admin/cleartimes/" + div.getAttribute("timeid"), {
		method: "DELETE"
	});

	autoClear();
}

function timeClick(event, div) {
	if (event.target.tagName == "IMG") {
		deleteTime(div);
	} else {
		toggleTime(div);
		div.children[2].checked = !div.children[2].checked;
	}
}
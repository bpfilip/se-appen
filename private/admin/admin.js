function initialize() {
	const settingsLocation = new URL(window.location.href).searchParams.get("admin");

	const locations = ["confirm-users", "show-users", "rooms", "clear"]

	if (!settingsLocation) {
		getUnverifiedCount();
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
}

async function getUnverifiedCount() {
	let res = await fetch("/admin/users/unverified/count");
	let data = await res.json();
	let count = data.count;
	console.log(count)
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
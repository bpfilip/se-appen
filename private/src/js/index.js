let img;

let cords = [];

function preload() {
	img = loadImage('/private/src/images/skole.png');
}

const socket = io();

socket.on("checked", msg => {
	getRooms();
	getEvents()
})

function setup() {
	let canvas = createCanvas(726, 480)
	canvas.parent("canvas");
	canvas.elt.style.width = "100%";
	canvas.elt.style.height = "auto";
	image(img, 0, 0, 726, 480);

	getRooms();
	getEvents();
}

function draw() {
	dots.forEach(dot => {
		if (!dot) return;
		fill(227, 16, 16);
		if (dot.checked) fill(0, 240, 68)
		textSize(20);
		textAlign(CENTER, CENTER);
		text(dot.number, dot.x, dot.y);
	});
}

function mousePressed() {
	cords.push({ x: mouseX, y: mouseY })
}

async function check() {
	let res = await fetch("/checked", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({})
	})

	getRooms();
	getEvents();
}

async function getRooms() {
	let res = await fetch("/rooms");
	let rooms = await res.json();

	for (let i = 0; i < Object.keys(rooms).length; i++) {
		let room = rooms[i]
		dots[room.number].checked = room.checked;
	}
}

async function getEvents() {
	let res = await fetch("/events");
	let events = await res.json();

	if (events.length < 1) return;

	generateEvents(events)

	console.log(events)
}

function generateEvents(events) {
	const parent = document.createElement("div");
	let content = "";

	events.forEach(event => {
		let createdAt = new Date(event.createdAt);
		content += `
			<div class="event">
				<span class="number">Værelse: ${event.room}</span>
				<span class="time">${createdAt.getHours() < 10 ? "0" + createdAt.getHours() : createdAt.getHours()}:${createdAt.getMinutes() < 10 ? "0" + createdAt.getMinutes() : createdAt.getMinutes()}</span>
				<br>
				<span class="name">${event.user}</span>
			</div>
		`;
	})

	let eventsDiv = document.getElementById("events");
	eventsDiv.innerHTML = content
	eventsDiv.style.maxHeight = (windowHeight - 271 - document.getElementById("canvas").clientHeight) + "px";
}
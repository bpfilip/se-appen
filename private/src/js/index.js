let img;

let cords = [];

function preload() {
	img = loadImage('/private/src/images/skole.png');
}

function setup() {
	let canvas = createCanvas(726, 480)
	canvas.parent("canvas");
	canvas.elt.style.width = "100%";
	canvas.elt.style.height = "auto";
	image(img, 0, 0, 726, 480);

	getRooms();
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

	getRooms()
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

	console.log(events)
}

function generateEvents() {

}
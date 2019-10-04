function initialize() {
	const settingsLocation = new URL(window.location.href).searchParams.get("admin");

	const locations = ["confirm-users", "show-users"]

	if (!locations.includes(settingsLocation)) return;

	if (settingsLocation) {
		document.getElementById("root").style.display = "none";
		document.getElementById(settingsLocation).style.display = "block";
	}
	if (settingsLocation == "confirm-users") {
		getUnverified();
	}
}

async function getUnverified() {
	const res = await fetch("/admin/users/unverified");

	const users = await res.json()

	console.log(users)

	insertUnverified(users);
}

function insertUnverified(users) {

	const parent = document.getElementById("confirm-users");

	parent.innerHTML = "";

	for (let i in users) {
		parent.appendChild(generateUser(users[i]));
	}

}

function generateUser(user) {
	const div = document.createElement('div');
	const content = `
	<div class="user-confirm">
		<span class="name">${user.name}</span>
		<div class="allow">
			<img width="50" height="50" src="/private/src/images/checkmark.png">
		</div>
		<br>
		<span class="mail">${user.email}</span>
		<div class="disallow">
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
		
	})
}
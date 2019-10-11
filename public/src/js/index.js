if (window.localStorage.getItem("token")) {
	document.cookie = "token=" + window.localStorage.getItem("token");
	document.location.href = "/private/"
}

function initialize() {
	const newUser = new URL(window.location.href).searchParams.get("newuser");
	
	if (newUser == "true") {
		document.getElementById("new-user").style.display = "block"
	}
}

function toRegister() {
	let login = document.getElementsByClassName("login-form");
	let register = document.getElementsByClassName("register-form");
	for (let i = 0; i < login.length; i++) {
		login.item(i).style.display = "none";
	}
	for (let i = 0; i < register.length; i++) {
		register.item(i).style.display = "block";
	}
}

function toLogin() {
	let login = document.getElementsByClassName("login-form");
	let register = document.getElementsByClassName("register-form");
	for (let i = 0; i < login.length; i++) {
		login.item(i).style.display = "block";
	}
	for (let i = 0; i < register.length; i++) {
		register.item(i).style.display = "none";
	}
}

async function login(form) {
	if (!(form.username.value)) {
		let errorBox = document.getElementById("login-error");
		errorBox.innerText = "Du skal indtaste et brugernavn";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.password.value)) {
		let errorBox = document.getElementById("login-error");
		errorBox.innerText = "Du skal indtaste en adgangskode";
		errorBox.style.display = "block";
		return;
	}
	let res = await fetch("/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: form.username.value,
			password: form.password.value
		})
	});
	if (res.status == 401) {
		let errorBox = document.getElementById("login-error");
		errorBox.innerText = "Adgangskoden eller brugernavnet var forkert";
		errorBox.style.display = "block";
		return;
	}
	if (res.status == 403) {
		let err = await res.text();
		if (err == "The user has not been verified yet") {
			let errorBox = document.getElementById("login-error");
			errorBox.innerText = "Du er ikke blevet bekræftet endnu";
			errorBox.style.display = "block";
			return;
		}
	}
	let data = await res.json();
	localStorage.setItem("token", data.token);
	document.cookie = "token=" + data.token;
	document.location.href = "/private/";
}

async function register(form) {
	if (!(form.name.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Du skal indtaste dit navn";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.username.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Du skal indtaste et brugernavn";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.email.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Du skal indtaste din email";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.room.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Du skal indtaste dit rum nummer";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.password.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Du skal indtaste en adgangskode";
		errorBox.style.display = "block";
		return;
	}
	if (form.password2.value !== form.password.value) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Adgangskoderne er ikke ens";
		errorBox.style.display = "block";
		return;
	}
	if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		.test(form.email.value)) {
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = "Det er ikke en valid email";
		errorBox.style.display = "block";
		return;
	}
	let res = await fetch("/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			name: form.name.value,
			username: form.username.value,
			email: form.email.value,
			roomNmb: form.room.value,
			password: form.password.value
		})
	});
	if (res.status == 400) {
		let error = await res.text();
		let errorBox = document.getElementById("register-error");
		errorBox.innerText = error;
		errorBox.style.display = "block";
		return;
	}
	document.location.href = "/?newuser=true";
}
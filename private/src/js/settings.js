function initialize () {
    const settingsLocation = new URL(window.location.href).searchParams.get("setting");
    
    const locations = ["profile-details", "change-name", "change-username", "change-password", "change-mail", "notification-settings"]
    
    if (settingsLocation && locations.includes(settingsLocation)) {
        document.getElementById("root").style.display = "none";
        document.getElementById(settingsLocation).style.display = "block";
    }
}

async function changePassword(form) {
	if (!(form.current.value)) {
		let errorBox = document.getElementById("change-password-error");
		errorBox.innerText = "Du skal indtaste din nuværende adgangskode";
		errorBox.style.display = "block";
		return;
	}
	if (!(form.password.value)) {
		let errorBox = document.getElementById("change-password-error");
		errorBox.innerText = "Du skal indtaste en adgangskode";
		errorBox.style.display = "block";
		return;
    }
    if (form.password.value !== form.confirm.value) {
		let errorBox = document.getElementById("change-password-error");
		errorBox.innerText = "Adgangskoderne er ikke ens";
		errorBox.style.display = "block";
		return;
	}
    if (form.password.value !== form.new.value) {
		let errorBox = document.getElementById("change-password-error");
		errorBox.innerText = "Din nye adgangskode kan ikke være det samme";
		errorBox.style.display = "block";
		return;
	}
	let res = await fetch("/users/change/password", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			current: form.current.value,
			new: form.password.value
		})
	});
	if (res.status == 401) {
		let errorBox = document.getElementById("change-password-error");
		errorBox.innerText = "Adgangskoden eller brugernavnet var forkert";
		errorBox.style.display = "block";
		return;
	}
	let data = await res.json();
	document.location.href = "/private/";
}
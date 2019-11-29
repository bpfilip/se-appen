async function notificationSettings() {
    let res = await fetch("/groups/");
    let groups = await res.json()

    let parent = document.querySelector("#groups");

    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        let rooms = group.rooms;
        let roomsContent = "";
        for (let j = 0; j < rooms.length; j++) {
            roomsContent += `
            <p class="room">Værelse: ${rooms[j]}</p>
            `;
        }
        let content = `
        <div class="group"
            onclick="if(event.target.type=='checkbox'||event.target.classList.contains('delete')) return;this.children[4].style.display = this.children[4].style.display == 'block'?'none':'block'; this.children[0].style.transform = this.children[4].style.display == 'block'? 'rotate(90deg)':''">
            <img class="toggle" src="/private/src/images/arrow.svg">
            <span class="name">${group.name}</span>
            <img class="delete" src="/private/src/images/x.png" onclick="deleteGroup('${group.name}')" ${group.public ? 'style="display:none;"' : ""}>
            <input ${group.enabled ? "checked" : ""} class="toggle-group" type="checkbox" onclick="toggleGroup('${group.name}')">
            <div class="rooms" style="display: none;">
                ${roomsContent}
            </div>
        </div>
        `;

        parent.innerHTML += content;
    }
}

async function toggleGroup(groupName) {
    let res = await fetch("/groups/toggle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            group: groupName
        })
    })
}

async function deleteGroup(groupName) {
    let res = await fetch("/groups/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            group: groupName
        })
    })
    location.reload();
}

async function createGroup(form) {
    if (!(form.name.value)) {
        let errorBox = document.getElementById("add-group-error");
        errorBox.innerText = "Du skal indtaste et navn";
        errorBox.style.display = "block";
        return;
    }
    if (getSelectValues(form.rooms).length < 1) {
        let errorBox = document.getElementById("add-group-error");
        errorBox.innerText = "Du skal indtaste et værelse";
        errorBox.style.display = "block";
        return;
    }
    let res = await fetch("/groups/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: form.name.value,
            rooms: getSelectValues(form.rooms)
        })
    });
    location.reload();
}

function getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;
}

document.addEventListener('keyup', e => {
    if (e.key === "Escape") { 
        document.querySelector("#add-group-wrapper").style.display = "none";
    }
});
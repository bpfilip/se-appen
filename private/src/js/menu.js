let me;

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches ||             // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > 100 || Math.abs(yDiff) > 100) {

        if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
            if (xDiff > 0) {
                // console.log("left")
                document.getElementsByClassName("menu")[0].style.display = "none";
                document.getElementById("menu-item-tjek").style.display = "none";
            } else {
                // console.log("right")
                document.getElementsByClassName("menu")[0].style.display = "block";
            }
        } else {
            if (yDiff > 0) {
                // console.log("up")
            } else {
                // console.log("down")
            }
        }
        /* reset values */
        xDown = xUp;
        yDown = yUp;
    }
};

window.onclick = function (event) {
    if (event.target == document.getElementsByClassName("menu")[0] || event.target == document.getElementsByClassName("title")[0] || event.target == document.getElementsByClassName("logo")[0]) {
        document.getElementsByClassName("menu")[0].style.display = "none";
        document.getElementById("menu-item-tjek").style.display = "none";
    }
}

function goto(href) {
    window.location.href = href;
}

async function getUser() {
    let res = await fetch("/users/me", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": "Bearer " + localStorage.getItem("token")
        }
    })

    let user = await res.json();
    me = user;

    if (user.admin) {
        document.getElementById("menu-item-admin").style.display = "block";
    }
}

getUser();

function toggleTjek() {
    const element = document.getElementById("menu-item-tjek");

    if (element.style.display == "block") {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}
const fs = require("fs");

let output = ["/", "/private/"];

search("./private/");
search("./public/");

function search(dir) {
    let content = fs.readdirSync(dir, {encoding: "UTF8"});

    content.forEach(elm => {
        if (elm.includes(".")) return output.push(dir+elm);
        search(dir+elm+"/")
    });
}

output = output.map(elm => {
    return elm.replace(".", "")
});

output = output.map(elm => {
    return elm.replace("/public", "")
});

console.log(output)
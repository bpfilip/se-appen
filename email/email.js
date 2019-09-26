const fs = require('fs');
const jwt = require('jsonwebtoken');
const jwtSecret = fs.readFileSync("./jwt.key", { encoding: "UTF8" });

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.email, // generated ethereal user
        pass: process.env.emailPassword // generated ethereal password
    }
});

async function sendVerification(user) {
    const token = jwt.sign({ data: { name: user.name, email: user.email } }, jwtSecret);

    fs.readFile("./email/verification.html", { encoding: "UTF8" }, async (err, html) => {

        console.log(err)

        console.log(html)

        while (html.includes("${token}")) {
            html = html.replace("${token}", token)
        }

        let email = await transporter.sendMail({
            from: `"SE-Appen" <${process.env.email}>`,
            to: user.email,
            subject: 'Email verification',
            html
        })

        console.log('Message sent: %s', email.messageId);
    });
}

module.exports = { sendVerification };
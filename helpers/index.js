//Voici notre packgae qui permet l'envoie de mail en js
const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@node-react.com" };

//Voici notre méthode pour configurer l'envoie de mail
exports.sendEmail = emailData => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "mongoapirest@gmail.com",
            pass: "Mongoapirest1!"
        }
    });
    return (
        transporter
            .sendMail(emailData)
            .then(info => console.log(`Message sent: ${info.response}`))
            .catch(err => console.log(`Problem sending email: ${err}`))
    );
};

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Vous pouvez utiliser un autre service de messagerie, par exemple, Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction pour envoyer un email de vérification
export async function sendVerificationEmail(userEmail) {
  const mailOptions = {
    from: "doriandelpeux62@gmail.com",
    to: userEmail,
    subject: "Vérification de compte",
    text: "Veuillez vérifier votre compte en cliquant sur le lien suivant : [lien de vérification]",
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(
          "Erreur lors de l'envoi de l'email de vérification:",
          error
        );
        reject(error);
      } else {
        console.log("Email de vérification envoyé:", info.response);
        resolve(info);
      }
    });
  });
}

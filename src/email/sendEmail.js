import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export async function sendEmail(email,text) {
  
// const transporter = nodemailer.createTransport({
//   host: 'smtp.hostinger.com',
//   port: 587,
//   secure: false,
//   auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//   },
//   logger: true, // Logs SMTP communication
//   debug: true,  // Shows detailed logs
// });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  const info = await transporter.sendMail({
    from: `Admin " <abdelrahmanmohammed851@gmail.com>`, // sender address
    to: `${email}`, // list of receivers
    subject: "Email Verification", // Subject line
    text: `${text}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}

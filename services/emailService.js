import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "");

const sendEmail = (to, subject, html) => {
  resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: subject,
    html: html,
  });
};

export { sendEmail };

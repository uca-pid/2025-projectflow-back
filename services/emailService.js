import { Resend } from "resend";

const resend = new Resend("re_5kpuU9hL_5AG3GHBLKQvnM3g1yjCt8Zkh");

const sendEmail = (to, subject, html) => {
  resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: subject,
    html: html,
  });
};

export { sendEmail };

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpService = process.env.SMTP_SERVICE || '';
const smtpHost = process.env.SMTP_HOST || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

export async function sendVerificationEmail(email: string, verificationCode: string) {
  const transporter = nodemailer.createTransport({
    service: smtpService,
    host:smtpHost,
    port:465,
    secure:true,
    auth: {
      user: smtpUser, 
      pass: smtpPass, 
    },
  });

  const mailOptions = {
    from: smtpUser,
    to: email,
    subject: 'Email Verification',
    text: `Click <a href="https://cartle.io/merchant/auth/verify/${verificationCode}">here</a> to verify your account.`,
  };
    // Send the email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
    } catch (error) {
      console.error(`Error sending email: ${error}`);
    }
}

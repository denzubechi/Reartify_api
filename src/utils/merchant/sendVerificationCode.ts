import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpService = process.env.SMTP_SERVICE || '';
const smtpHost = process.env.SMTP_HOST || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

export async function sendVerificationCode(email: string, verificationCode: string) {
    const transporter = nodemailer.createTransport({
      service: smtpService,
      host: smtpHost,
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  
    const mailOptions = {
      from: smtpUser,
      to: email,
      subject: 'Nesite  Verification Code',
      text: `

      <div style="text-align:center">
      <h2>Verification Code</h2>
      Your verification code is: ${verificationCode}
      </div>

      `,
    };
  
    // Send the email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
    } catch (error) {
      console.error(`Error sending email: ${error}`);
    }
  }
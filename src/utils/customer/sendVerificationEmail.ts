import nodemailer from 'nodemailer';

const emailSender = process.env.SMTP_USER || '';
const emailPassword = process.env.SMTP_PASS || '';

// Function to send a verification email
export const sendVerificationEmail = async (email:string, token:string) => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., 'Gmail'
      auth: {
        user: emailSender,
        pass: emailPassword,
      },
    });

    // Email message
    const mailOptions = {
      from: emailSender,
      to: email,
      subject: 'Account Verification',
      text: `Click the following link to verify your account: https://user/auth/verify/${token}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error; // You can handle or log the error as needed
  }
};

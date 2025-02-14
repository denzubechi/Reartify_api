import { transporter } from "../transporter";

export const sendVerificationCode = async (email: string, code: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM, 
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${code}`,
      html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
    });
    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

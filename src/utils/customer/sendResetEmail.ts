import nodemailer from 'nodemailer';

const emailSender = process.env.SMTP_USER || '';
const emailPassword = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: emailSender,
    pass: emailPassword, 
  },
});

const sendPasswordResetEmail = (recipientEmail:string, resetToken:string) => {
  const mailOptions = {
    from: emailSender, 
    to: recipientEmail,
    subject: 'Password Reset',
    text: `To reset your password, click the following link: http://localhost:5000/auth/reset-password/${resetToken}`, // Email body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending password reset email:', error);
    } else {
      console.log('Password reset email sent:', info.response);
    }
  });
};

export { sendPasswordResetEmail };

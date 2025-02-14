import { transporter } from "../transporter";
export const sendInvitationEmail = async (recipientEmail: string, password: string) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: recipientEmail,
        subject: 'You’ve been invited to join SignalBox!', 
        text: `You have been invited by  to join SignalBox. Your login credentials are: \n\nEmail: ${recipientEmail}\nPassword: ${password}\n\nPlease change your password after logging in.`,
        html: `
          <p>You have been invited  to join SignalBox.</p>
          <p>Your login credentials are:</p>
          <ul>
            <li>Email: <strong>${recipientEmail}</strong></li>
            <li>Password: <strong>${password}</strong></li>
          </ul>
          <p>Please change your password after logging in.</p>
        `,
      });
  
      console.log(`Invitation email sent: ${info.messageId}`);
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  };
import { sendEmail } from "../../mailer";
import { Request, Response } from "express";
export const emailController = async (req: Request, res: Response) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await sendEmail(to, subject, text);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};

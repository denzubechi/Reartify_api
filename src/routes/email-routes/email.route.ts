import express from "express";
import { emailController } from "../../controllers/email-controllers/email.controller";
const router = express.Router();

router.post("/send-email", emailController);

export { router as EmailRouter };

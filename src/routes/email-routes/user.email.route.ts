import { Router } from "express";
import { emailControllers } from "../../controllers/email-controllers/user.email.controller";
const router = Router();

router.post("/gmail", emailControllers.addGmail);
router.post("/aol", emailControllers.addAol);
router.post("/yahoo", emailControllers.addYahoo);
router.post("/icloud", emailControllers.addIcloud);
router.post("/office", emailControllers.addOffice);
router.post("/outlook", emailControllers.addOutlook);
router.post("/exchange", emailControllers.addExchange);

export { router as UserEmailRouter };

import { Router } from "express";
import { getAllUsers } from "../../controllers/email-controllers/users.controller";
const router = Router();

router.get("/users", getAllUsers);

export { router as UserRouter };

import { Router } from "express";
import { loginController, logoutController } from "./auth.controller";

const router = Router();

router.post("/login", loginController);
router.post("/logout", logoutController);

export { router as authRouter };

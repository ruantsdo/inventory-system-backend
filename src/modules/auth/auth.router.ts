import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  checkSessionController,
  loginController,
  logoutController,
  refreshController,
  resetPasswordFirstStepController,
  resetPasswordSecondStepController,
} from "./auth.controller";

const router = Router();

router.post("/login", loginController);
router.post("/refresh-token", refreshController);
router.post("/reset-password/first-step", resetPasswordFirstStepController);
router.post("/reset-password/second-step", resetPasswordSecondStepController);

router.get("/check-session", authenticate, checkSessionController);
router.post("/logout", authenticate, logoutController);

export { router as authRouter };

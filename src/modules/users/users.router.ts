import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  confirmActivationController,
  createUserController,
  resendActivationController,
} from "./users.controller";

const router = Router();

router.post("/createNewUser", authenticate, authorize("users.create"), createUserController);

router.post("/activation/resend", resendActivationController);
router.post("/activation/confirm", confirmActivationController);

export { router as usersRouter };

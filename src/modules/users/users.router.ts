import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  confirmActivationController,
  createUserController,
  getAllUsersController,
  getUsersByFacilityIdController,
  resendActivationController,
} from "./users.controller";

const router = Router();

router.post("/createNewUser", authenticate, authorize("users.create"), createUserController);

router.post("/activation/resend", resendActivationController);
router.post("/activation/confirm", confirmActivationController);

router.get("/get/all", authenticate, authorize("users.view"), getAllUsersController);
router.get(
  "/get/facility-id/:facilityId",
  authenticate,
  authorize("users.view"),
  getUsersByFacilityIdController
);

export { router as usersRouter };

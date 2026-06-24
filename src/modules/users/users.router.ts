import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  confirmActivationController,
  createUserController,
  getAllUsersController,
  getBasicUserDataByCpfController,
  getBasicUserDataByEmailController,
  getBasicUserDataByIdController,
  getSelfDataController,
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
router.get("/get/selfData/", authenticate, getSelfDataController);
router.get(
  "/get/byId/:targetId",
  authenticate,
  authorize("users.view"),
  getBasicUserDataByIdController
);
router.get(
  "/get/byCpf/:targetCpf",
  authenticate,
  authorize("users.view"),
  getBasicUserDataByCpfController
);
router.get(
  "/get/byEmail/:targetEmail",
  authenticate,
  authorize("users.view"),
  getBasicUserDataByEmailController
);

export { router as usersRouter };

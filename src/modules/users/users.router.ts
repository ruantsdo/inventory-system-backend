import { governance } from "@/shared/middleware/governance/governanceMiddleware";
import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { resolveActiveFacility } from "../../shared/middleware/resolveActiveFacility";
import {
  confirmActivationController,
  createUserController,
  deactivateUserController,
  getAllUsersController,
  getBasicUserDataByCpfController,
  getBasicUserDataByEmailController,
  getBasicUserDataByIdController,
  getSelfDataController,
  getUserEditDataController,
  getUsersByFacilityIdController,
  reactivateUserController,
  removeUserController,
  resendActivationController,
  updateUserController,
} from "./users.controller";

const router = Router();

router.post("/activation/resend", resendActivationController);
router.post("/activation/confirm", confirmActivationController);

router.use(authenticate, resolveActiveFacility);

router.post(
  "/createNewUser",
  authorize("users.create"),
  governance.verifyUserCreation(),
  createUserController
);
router.put(
  "/update/:targetId",
  authorize("users.update"),
  governance.verifyUserUpdate(),
  updateUserController
);

router.delete(
  "/delete/:targetId",
  authorize("users.delete"),
  governance.verifyUserStatusOrRemoval(),
  removeUserController
);

router.put(
  "/reactivate/:targetId",
  authorize("users.activate"),
  governance.verifyUserStatusOrRemoval(),
  reactivateUserController
);
router.put(
  "/deactivate/:targetId",
  authorize("users.deactivate"),
  governance.verifyUserStatusOrRemoval(),
  deactivateUserController
);

router.get("/get/all", authorize("users.view"), getAllUsersController);
router.get("/get/facility-id/:facilityId", authorize("users.view"), getUsersByFacilityIdController);
router.get("/get/selfData/", getSelfDataController);
router.get("/get/byId/:targetId", authorize("users.view"), getBasicUserDataByIdController);
router.get("/get/byCpf/:targetCpf", authorize("users.view"), getBasicUserDataByCpfController);
router.get("/get/byEmail/:targetEmail", authorize("users.view"), getBasicUserDataByEmailController);
router.get("/get/editData/:targetId", authorize("users.view"), getUserEditDataController);

export { router as usersRouter };

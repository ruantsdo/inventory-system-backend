import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getAllRolesController,
  getCurrentUserPermissionsController,
} from "./permissions.controller";

const router = Router();

router.use(authenticate);

router.get("/roles/all", getAllRolesController);
router.get("/currentUser", getCurrentUserPermissionsController);

export { router as permissionsRouter };

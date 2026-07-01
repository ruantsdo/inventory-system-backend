import { authorize } from "@/shared/middleware/authorize";
import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { resolveActiveFacility } from "../../shared/middleware/resolveActiveFacility";
import {
  getActiveFacilitiesByCityController,
  getAllActiveFacilitiesController,
  getAllFacilitiesController,
  getAllFacilitiesForSessionController,
} from "./facilities.controller";

const router = Router();

router.get("/active/session", authenticate, getAllFacilitiesForSessionController);

router.use(authenticate, resolveActiveFacility);

router.get("/all", authorize("facilities.view"), getAllFacilitiesController);
router.get("/active", authorize("facilities.view"), getAllActiveFacilitiesController);
router.get("/:cityId/active", authorize("facilities.view"), getActiveFacilitiesByCityController);

export { router as facilitiesRouter };

import { authorize } from "@/shared/middleware/authorize";
import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getActiveFacilitiesByCityController,
  getAllActiveFacilitiesController,
  getAllFacilitiesController,
  getAllFacilitiesForSessionController,
} from "./facilities.controller";

const router = Router();

router.use(authenticate);

router.get("/all", authorize("facilities.view"), getAllFacilitiesController);
router.get("/active", authorize("facilities.view"), getAllActiveFacilitiesController);
router.get("/:cityId/active", authorize("facilities.view"), getActiveFacilitiesByCityController);
router.get("/active/session", getAllFacilitiesForSessionController);

export { router as facilitiesRouter };

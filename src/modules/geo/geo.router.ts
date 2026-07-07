import { authorize } from "@/shared/middleware/authorize";
import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { getAllCitiesController, getCitiesWithActiveFacilitiesController } from "./geo.controller";

const router = Router();

router.use(authenticate);

router.get("/cities/all", authorize("cities.view"), getAllCitiesController);
router.get("/cities", authorize("cities.view"), getCitiesWithActiveFacilitiesController);

export { router as geoRouter };

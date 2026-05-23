import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getActiveFacilitiesByCityController,
  getAllCitiesController,
  getCitiesWithActiveFacilitiesController,
} from "./geo.controller";

const router = Router();

router.use(authenticate);

router.get("/cities/all", getAllCitiesController);
router.get("/cities", getCitiesWithActiveFacilitiesController);
router.get("/cities/:cityId/units", getActiveFacilitiesByCityController);

export { router as geoRouter };

import type { NextFunction, Request, Response } from "express";
import { GeoService } from "./geo.service";

export async function getAllCitiesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const cities = await GeoService.getAllCities();
    res.status(200).json({ status: "ok", cities });
  } catch (error) {
    next(error);
  }
}

export async function getCitiesWithActiveFacilitiesController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cities = await GeoService.getCitiesWithActiveFacilities();
    res.status(200).json({ status: "ok", cities });
  } catch (error) {
    next(error);
  }
}

import type { NextFunction, Request, Response } from "express";
import { FacilityService } from "./facilities.service";

export async function getAllFacilitiesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const facilities = await FacilityService.getAllFacilities();
    res.status(200).json({ status: "ok", facilities });
  } catch (error) {
    next(error);
  }
}

export async function getAllActiveFacilitiesController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const facilities = await FacilityService.getAllActiveFacilities();
    res.status(200).json({ status: "ok", facilities });
  } catch (error) {
    next(error);
  }
}

export async function getActiveFacilitiesByCityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cityId = req.params.cityId as string;
    const facilities = await FacilityService.getActiveFacilitiesByCity(cityId);
    res.status(200).json({ status: "ok", facilities });
  } catch (error) {
    next(error);
  }
}

export async function getAllFacilitiesForSessionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Não autorizado" });
      return;
    }
    const facilities = await FacilityService.getActiveFacilitiesForSession(userId);
    res.status(200).json({ status: "ok", facilities });
  } catch (error) {
    next(error);
  }
}

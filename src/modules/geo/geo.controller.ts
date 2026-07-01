import type { CityOutput } from "@/shared/types/api.contracts";
import { checkIfRootUser } from "@/shared/utils/verifiers";
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const callerId = req.user?.id;

    if (!callerId) throw new Error("Usuário não autenticado.");

    const isRootUser = await checkIfRootUser(callerId);

    let cities: CityOutput[] = [];

    if (isRootUser) {
      cities = await GeoService.getAllCitiesWithActiveFacilities();
      res.status(200).json({ status: "ok", cities });
      return;
    }

    const citiesIds = await GeoService.findAuthorizedCitiesIDs(callerId);

    cities = await GeoService.getCitiesWithActiveFacilities(citiesIds);

    res.status(200).json({ status: "ok", cities });
  } catch (error) {
    next(error);
  }
}

import type { AuditCategory, AuditSeverity } from "@/generated/prisma/enums";
import type { NextFunction, Request, Response } from "express";
import { AuditService } from "./audit.service";

export async function getFirstOneThousandController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Number(req.query.page) || 1;
    const auditEvents = await AuditService.getFirstOneThousand(page);
    res.status(200).json({ status: "ok", auditEvents });
  } catch (error) {
    next(error);
  }
}

export async function getByActionController(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const action = req.query.action as string;
    const auditEvents = await AuditService.getByAction(action, page);
    res.status(200).json({ status: "ok", auditEvents });
  } catch (error) {
    next(error);
  }
}

export async function getByCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const category = req.query.category as AuditCategory;
    const auditEvents = await AuditService.getByCategory(category, page);
    res.status(200).json({ status: "ok", auditEvents });
  } catch (error) {
    next(error);
  }
}

export async function getBySeverityController(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const severity = req.query.severity as AuditSeverity;
    const auditEvents = await AuditService.getBySeverity(severity, page);
    res.status(200).json({ status: "ok", auditEvents });
  } catch (error) {
    next(error);
  }
}

export async function getDetailAuditEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.query.id as string;
    const auditEvent = await AuditService.getDetailAuditEvent(id);
    res.status(200).json({ status: "ok", auditEvent });
  } catch (error) {
    next(error);
  }
}

import { authorize } from "@/shared/middleware/authorize";
import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getByActionController,
  getByCategoryController,
  getBySeverityController,
  getDetailAuditEventController,
  getFirstOneThousandController,
} from "./audit.controller";

const router = Router();
router.use(authenticate, authorize("audit.view"));

router.get("/", getFirstOneThousandController);
router.get("/action", getByActionController);
router.get("/category", getByCategoryController);
router.get("/severity", getBySeverityController);
router.get("/detail", getDetailAuditEventController);

export { router as auditRouter };

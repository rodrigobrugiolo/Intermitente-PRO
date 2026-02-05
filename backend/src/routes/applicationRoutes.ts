import express from "express";
import {
  applyToVacancy,
  getMyApplications,
  cancelApplication,
  deleteApplication,
} from "../controllers/applicationController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/apply", authMiddleware, applyToVacancy);
router.get("/my-applications", authMiddleware, getMyApplications);
router.put("/applications/:id/cancel", authMiddleware, cancelApplication);
router.delete("/applications/:id", authMiddleware, deleteApplication);

export default router;

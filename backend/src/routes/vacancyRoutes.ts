import express from "express";
import {
  getVacancies,
  createVacancy,
  deleteVacancy,
  updateVacancy,
  getMyVacancies,
  getApplicationsForVacancy,
  updateApplicationStatus,
  addUserToVacancy,
  getExpiredVacancies,
} from "../controllers/vacancyController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/vacancies", getVacancies);
router.get("/vacancies/expired", getExpiredVacancies);
router.get("/my-vacancies", authMiddleware, getMyVacancies);
router.post("/vacancies", authMiddleware, createVacancy);
router.put("/vacancies/:id", authMiddleware, updateVacancy);
router.post("/vacancies/add-user", authMiddleware, addUserToVacancy);
router.delete("/vacancies/:id", authMiddleware, deleteVacancy);
router.get(
  "/vacancies/:vacancyId/applications",
  authMiddleware,
  getApplicationsForVacancy,
);
router.put("/applications/:id/status", authMiddleware, updateApplicationStatus);

export default router;

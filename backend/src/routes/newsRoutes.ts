import express from "express";
import { getNews, createNews } from "../controllers/newsController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/news", getNews);
router.post("/news", authMiddleware, createNews);

export default router;

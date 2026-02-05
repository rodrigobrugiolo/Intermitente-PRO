import express from "express";
import {
  login,
  createUser,
  getUsers,
  updateUser,
  updateProfile,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/login", login);
router.post("/users", authMiddleware, createUser);
router.get("/users", authMiddleware, getUsers);
router.put("/users/:id", authMiddleware, updateUser);
router.put("/profile", authMiddleware, updateProfile);

export default router;

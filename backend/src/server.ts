import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import vacancyRoutes from "./routes/vacancyRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import newsRoutes from "./routes/newsRoutes";
import { errorHandler } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI não definida no .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err: any) => {
    console.error("❌ Erro ao conectar MongoDB:", err);
    process.exit(1);
  });

// Routes
app.use("/api", userRoutes);
app.use("/api", vacancyRoutes);
app.use("/api", applicationRoutes);
app.use("/api", newsRoutes);

// Health check
app.get("/health", (req: any, res: any) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Error Handler
app.use(errorHandler);

// Start Server
const HOST = process.env.HOST || "0.0.0.0";
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});

export default app;

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = (decoded as any).userId;
    req.user = {
      userId: (decoded as any).userId,
      name: (decoded as any).name,
      role: (decoded as any).role,
      phone: (decoded as any).phone,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Erro interno do servidor" });
};

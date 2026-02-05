import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).password;

    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const createdBy = req.user;

    // Validação de permissão
    if (createdBy.role === UserRole.INTERMITTENT) {
      return res
        .status(403)
        .json({ message: "Intermitentes não podem criar usuários" });
    }

    // LEADER só pode criar INTERMITTENT
    if (createdBy.role === UserRole.LEADER && role !== UserRole.INTERMITTENT) {
      return res.status(403).json({
        message: "Líderes só podem criar usuários do tipo Intermitente",
      });
    }

    // ADMIN pode criar ADMIN, LEADER ou INTERMITTENT
    if (
      createdBy.role === UserRole.ADMIN &&
      role !== UserRole.ADMIN &&
      role !== UserRole.LEADER &&
      role !== UserRole.INTERMITTENT
    ) {
      return res.status(403).json({
        message: "Admins podem criar ADMIN, LEADER ou INTERMITTENT",
      });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || UserRole.INTERMITTENT,
    });

    await newUser.save();

    const userWithoutPassword = newUser.toObject();
    delete (userWithoutPassword as any).password;

    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, cpf, address, pixKey, profilePic, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, cpf, address, pixKey, profilePic, phone },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

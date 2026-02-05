import { Response } from "express";
import { News } from "../models/News";
import { AuthRequest } from "../middleware/auth";

export const getNews = async (req: AuthRequest, res: Response) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNews = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    const newPost = new News({
      title,
      content,
      authorId: req.userId,
      authorName: req.user.name,
      authorRole: req.user.role,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

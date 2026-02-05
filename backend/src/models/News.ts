import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
  },
  { timestamps: true },
);

export const News = mongoose.model("News", NewsSchema);

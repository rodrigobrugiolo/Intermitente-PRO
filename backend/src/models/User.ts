import mongoose, { Document } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  LEADER = "LEADER",
  INTERMITTENT = "INTERMITTENT",
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  cpf?: string;
  address?: string;
  pixKey?: string;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.INTERMITTENT,
    },
    cpf: { type: String, sparse: true },
    address: { type: String, sparse: true },
    pixKey: { type: String, sparse: true },
    profilePic: { type: String, sparse: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);

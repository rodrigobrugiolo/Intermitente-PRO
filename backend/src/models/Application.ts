import mongoose from "mongoose";

export enum ApplicationStatus {
  PENDING = "pendente",
  APPROVED = "aprovado",
  REJECTED = "rejeitado",
  CANCELED = "cancelado_pelo_usuario",
}

const ApplicationSchema = new mongoose.Schema(
  {
    vacancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vacancy",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    userProfilePic: { type: String, sparse: true },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    insertedManually: { type: Boolean, default: false },
    insertedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    insertedByUserName: { type: String, sparse: true },
    // Histórico de ações
    processedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    processedByUserName: { type: String, sparse: true },
    processedAt: { type: Date, sparse: true },
  },
  { timestamps: true },
);

export const Application = mongoose.model("Application", ApplicationSchema);

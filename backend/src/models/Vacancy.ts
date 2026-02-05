import mongoose from "mongoose";

export enum VacancyStatus {
  OPEN = "open",
  FILLED = "filled",
  CANCELED = "canceled",
  EXPIRED = "expired",
}

const VacancySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    value: { type: Number, required: true },
    totalSpots: { type: Number, required: true },
    filledSpots: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(VacancyStatus),
      default: VacancyStatus.OPEN,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorName: { type: String, required: true },
  },
  { timestamps: true },
);

export const Vacancy = mongoose.model("Vacancy", VacancySchema);

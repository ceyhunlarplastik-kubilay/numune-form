import mongoose, { Schema, Document } from "mongoose";

export interface ISector extends Document {
    name: string;
}

const SectorSchema = new Schema<ISector>(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export const Sector =
    mongoose.models.Sector || mongoose.model<ISector>("Sector", SectorSchema);

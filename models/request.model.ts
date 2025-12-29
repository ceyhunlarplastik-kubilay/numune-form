import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IRequestProduct {
    productId: mongoose.Types.ObjectId;
    productionGroupId: mongoose.Types.ObjectId;
}

export interface IRequestStatusHistory {
    status: string;
    note?: string;
    updatedBy?: string;
    timestamp: Date;
}

export interface IRequest extends Document {
    companyName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    address?: string;

    sectorId: mongoose.Types.ObjectId | null;
    productionGroupIds: mongoose.Types.ObjectId[];
    products: IRequestProduct[];

    status: string;
    statusHistory: IRequestStatusHistory[];
}

const RequestSchema = new Schema<IRequest>(
    {
        companyName: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String },

        sectorId: { type: Schema.Types.ObjectId, ref: "Sector", default: null },

        productionGroupIds: [
            { type: Schema.Types.ObjectId, ref: "ProductionGroup" },
        ],

        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                productionGroupId: {
                    type: Schema.Types.ObjectId,
                    ref: "ProductionGroup",
                    required: true,
                },
            },
        ],

        // --- STATUS ---
        status: {
            type: String,
            enum: [
                "pending", // müşteri formu gönderdi
                "review", // admin inceledi
                "approved", // işlem yapılacak
                "preparing", // numune hazırlanıyor
                "shipped", // kargoya verildi
                "delivered", // müşteriye ulaştı
                "completed", // süreç tamamlandı
                "cancelled", // iptal edildi
            ],
            default: "pending",
        },

        // --- STATUS HISTORY ---
        statusHistory: [
            {
                status: String,
                note: String,
                updatedBy: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const Request =
    models.Request || model<IRequest>("Request", RequestSchema);

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { google } from "googleapis";
import { Sector, ProductionGroup, Product, ProductAssignment } from "@/models/index";

export async function GET() {
    try {
        await connectDB();

        // Google Auth
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = "Data!A2:C";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values || [];

        let inserted = {
            sectors: 0,
            groups: 0,
            products: 0,
            assignments: 0,
        };

        for (const row of rows) {
            ""
            const sectorName = row[0];
            const groupName = row[1];
            const productName = row[2];

            if (!sectorName || !groupName || !productName) continue;

            // 1) Sector
            let sector = await Sector.findOne({ name: sectorName });
            if (!sector) {
                sector = await Sector.create({ name: sectorName });
                inserted.sectors++;
            }

            // 2) Production Group
            let group = await ProductionGroup.findOne({
                name: groupName,
                sectorId: sector._id,
            });
            if (!group) {
                group = await ProductionGroup.create({
                    name: groupName,
                    sectorId: sector._id,
                });
                inserted.groups++;
            }

            // 3) Product
            let product = await Product.findOne({ name: productName });
            if (!product) {
                product = await Product.create({ name: productName });
                inserted.products++;
            }

            // 4) ProductAssignment
            try {
                await ProductAssignment.create({
                    sectorId: sector._id,
                    productionGroupId: group._id,
                    productId: product._id,
                });
                inserted.assignments++;
            } catch (e) {
                /* duplicate index — ignore */
            }
        }

        return NextResponse.json({
            message: "Normalized import completed",
            inserted,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

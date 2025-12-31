// app/api/customers/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Request, Sector, Product, ProductionGroup } from "@/models/index";

const DEFAULT_LIMIT = 10;

export async function GET(req: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search")?.trim() || "";
        const sectorId = searchParams.get("sector")?.trim() || "";
        const groupId = searchParams.get("productionGroup")?.trim() || "";
        const productId = searchParams.get("product")?.trim() || "";
        const page = Number(searchParams.get("page")) || 1;

        const limit = DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        /* -------------------------------------------------------------
           🔎 1) FİLTRE OLUŞTUR
           Artık üretim grubu & ürün, "products" array'ine göre filtrelenir
        ------------------------------------------------------------- */

        const filter: any = {};

        // SEKTÖR
        if (sectorId && sectorId !== "all") {
            filter.sectorId = sectorId;
        }

        // ÜRETİM GRUBU → products.productionGroupId içinde ara
        if (groupId && groupId !== "all") {
            filter["products.productionGroupId"] = groupId;
        }

        // ÜRÜN → products.productId içinde ara
        if (productId && productId !== "all" && productId !== "undefined") {
            filter["products.productId"] = productId;
        }

        /* -------------------------------------------------------------
           🔎 2) SEARCH MODE — Her field + ürün + grup + sektör içinde arar
        ------------------------------------------------------------- */

        if (search) {
            const regex = new RegExp(search, "i");

            const items = await Request.find(filter)
                .sort({ createdAt: -1 })
                .lean();

            const customers = await Promise.all(
                items.map(async (req) => {
                    const sectorDoc = req.sectorId
                        ? await Sector.findById(req.sectorId).lean()
                        : null;

                    // Tüm ürünleri topla
                    const productIds = req.products?.map((p: any) => p.productId) || [];
                    const groupIds = req.products?.map((p: any) => p.productionGroupId) || [];

                    const productDocs = await Product.find({ _id: { $in: productIds } }).lean();
                    const groupDocs = await ProductionGroup.find({ _id: { $in: groupIds } }).lean();

                    const combinedText = [
                        req.companyName,
                        req.firstName,
                        req.lastName,
                        req.email,
                        req.phone,
                        req.address,
                        sectorDoc?.name,
                        ...groupDocs.map((g) => g.name),
                        ...productDocs.map((p) => p.name),
                    ]
                        .filter(Boolean)
                        .join(" ");

                    if (!regex.test(combinedText)) return null;

                    return {
                        mongoId: req._id.toString(),
                        tarih: new Date(req.createdAt).toLocaleString("tr-TR"),
                        companyName: req.companyName,
                        firstName: req.firstName,
                        lastName: req.lastName,
                        email: req.email,
                        phone: req.phone,
                        address: req.address,
                        sector: sectorDoc?.name || "",
                        productionGroups: groupDocs.map((g) => g.name).join(", "),
                        products: productDocs.map((p) => p.name).join(", "),
                        status: req.status || "pending",
                    };
                })
            );

            const filtered = customers.filter(Boolean);

            return NextResponse.json({
                customers: filtered,
                pagination: {
                    total: filtered.length,
                    page: 1,
                    limit: filtered.length,
                    totalPages: 1,
                },
            });
        }

        /* -------------------------------------------------------------
           🔎 3) PAGINATION LIST MODE
        ------------------------------------------------------------- */

        const total = await Request.countDocuments(filter);

        const items = await Request.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const customers = await Promise.all(
            items.map(async (req) => {
                const sectorDoc = req.sectorId
                    ? await Sector.findById(req.sectorId).lean()
                    : null;

                const productIds = req.products?.map((p: any) => p.productId) || [];
                const groupIds = req.products?.map((p: any) => p.productionGroupId) || [];

                const productDocs = await Product.find({ _id: { $in: productIds } }).lean();
                const groupDocs = await ProductionGroup.find({ _id: { $in: groupIds } }).lean();

                return {
                    mongoId: req._id.toString(),
                    tarih: new Date(req.createdAt).toLocaleString("tr-TR"),
                    companyName: req.companyName,
                    firstName: req.firstName,
                    lastName: req.lastName,
                    email: req.email,
                    phone: req.phone,
                    address: req.address,
                    sector: sectorDoc?.name || "",
                    productionGroups: groupDocs.map((g) => g.name).join(", "),
                    products: productDocs.map((p) => p.name).join(", "),
                    status: req.status || "pending",
                };
            })
        );

        return NextResponse.json({
            customers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Customers API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product, ProductAssignment } from "@/models";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const productIdParam = searchParams.get("productId");

        // ❗ Hiç parametre yoksa → tüm ürünleri döndür
        if (!productIdParam) {
            const allProducts = await Product.find().lean();
            return NextResponse.json(allProducts);
        }

        // productId birden fazla olabilir → virgülle ayır
        const productIds = productIdParam.split(",").map((id) => id.trim());

        // ❗ Eğer 1 ID varsa tek ürün döndür
        if (productIds.length === 1) {
            const product = await Product.findById(productIds[0]).lean();

            if (!product) {
                return NextResponse.json(
                    { error: "Ürün bulunamadı" },
                    { status: 404 }
                );
            }

            return NextResponse.json(product);
        }

        // ❗ Birden fazla ID varsa array döndür
        const products = await Product.find({
            _id: { $in: productIds },
        }).lean();

        return NextResponse.json(products);
    } catch (error) {
        console.error("Products API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, description, imageUrl, assignments } = body;

        // Validation
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Ürün adı zorunludur" },
                { status: 400 }
            );
        }

        // assignments: [{ sectorId, productionGroupId }]
        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return NextResponse.json(
                { error: "En az bir sektör ve üretim grubu seçilmelidir" },
                { status: 400 }
            );
        }

        // Check for duplicate product name
        const existingProduct = await Product.findOne({ name: name.trim() });
        if (existingProduct) {
            return NextResponse.json(
                { error: "Bu isimde bir ürün zaten mevcut" },
                { status: 409 }
            );
        }

        // 1) Create Product
        const newProduct = await Product.create({
            name: name.trim(),
            description: description?.trim() || "",
            imageUrl: imageUrl?.trim() || "", // TODO: S3 integration
        });

        // 2) Create ProductAssignments
        const assignmentDocs = assignments.map((a: any) => ({
            productId: newProduct._id,
            productionGroupId: a.productionGroupId,
            sectorId: a.sectorId,
        }));

        await ProductAssignment.insertMany(assignmentDocs);

        return NextResponse.json(
            { success: true, product: newProduct, assignmentsCreated: assignmentDocs.length },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Product POST Error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Bu ürün zaten mevcut" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

export async function PUT(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { productId, name, description, imageUrl, assignments } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "productId zorunludur" },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Ürün bulunamadı" },
                { status: 404 }
            );
        }

        // Update product fields
        if (name !== undefined) product.name = name.trim();
        if (description !== undefined) product.description = description.trim();
        if (imageUrl !== undefined) product.imageUrl = imageUrl.trim(); // TODO: S3 integration

        await product.save();

        // If assignments are provided, update them
        if (assignments && Array.isArray(assignments)) {
            // Delete existing assignments
            await ProductAssignment.deleteMany({ productId });

            // Create new assignments
            if (assignments.length > 0) {
                const assignmentDocs = assignments.map((a: any) => ({
                    productId: product._id,
                    productionGroupId: a.productionGroupId,
                    sectorId: a.sectorId,
                }));

                await ProductAssignment.insertMany(assignmentDocs);
            }
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Product PUT Error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Bu isimde bir ürün zaten mevcut" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json(
                { error: "productId query param zorunludur" },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Ürün bulunamadı" },
                { status: 404 }
            );
        }

        // 1) Cascade delete: Remove all ProductAssignments
        const deleteResult = await ProductAssignment.deleteMany({ productId });

        // 2) Delete the product
        await Product.findByIdAndDelete(productId);

        return NextResponse.json({
            success: true,
            message: `Ürün ve ${deleteResult.deletedCount} assignment silindi`,
        });
    } catch (error) {
        console.error("Product DELETE Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

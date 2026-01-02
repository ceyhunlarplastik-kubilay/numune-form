
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Sector } from "@/models/index";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
    try {
        await connectDB();
        const sectors = await Sector.find().sort({ createdAt: -1 });
        return NextResponse.json(sectors);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Sector name is required" },
                { status: 400 }
            );
        }

        const existingSector = await Sector.findOne({ name });
        if (existingSector) {
            return NextResponse.json(
                { error: "Sector already exists" },
                { status: 400 }
            );
        }

        const sector = await Sector.create({ name });
        return NextResponse.json(sector, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authError = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json(
                { error: "ID and name are required" },
                { status: 400 }
            );
        }

        const sector = await Sector.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!sector) {
            return NextResponse.json(
                { error: "Sector not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(sector);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const sector = await Sector.findByIdAndDelete(id);

        if (!sector) {
            return NextResponse.json(
                { error: "Sector not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Sector deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

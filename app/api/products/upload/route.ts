import { handleUpload } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = await handleUpload({
            body,
            request: req,

            onBeforeGenerateToken: async () => {
                // 🔐 burada auth kontrolü yapabilirsin
                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                    maxFileSize: 5 * 1024 * 1024, // 5MB
                };
            },

            onUploadCompleted: async ({ blob }) => {
                // Burada DB yazmak ZORUNLU DEĞİL
                // Genelde frontend döner, sonra update edilir
                console.log("Upload completed:", blob.url);
            },
        });

        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const urlToDelete = searchParams.get("url");

        if (!urlToDelete) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        await del(urlToDelete);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete failed:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}

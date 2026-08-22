import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { brandingConfig, title, heroImageUrl } = body;

    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Event not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const updated = await db.event.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
        brandingConfigJson: typeof brandingConfig === "string"
          ? brandingConfig
          : JSON.stringify(brandingConfig || {}),
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to update branding: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const card = await prisma.weddingCard.findUnique({
      where: { slug: params.slug },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Parse design string back to JSON
    const cardWithParsedDesign = {
      ...card,
      design: typeof card.design === 'string' ? JSON.parse(card.design) : card.design,
    };

    return NextResponse.json(cardWithParsedDesign);
  } catch (error) {
    console.error("Error fetching card by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

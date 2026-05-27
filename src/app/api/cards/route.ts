import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.weddingCard.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    });

    // Parse design string back to JSON
    const cardsWithParsedDesign = cards.map(card => ({
      ...card,
      design: typeof card.design === 'string' ? JSON.parse(card.design) : card.design,
    }));

    return NextResponse.json(cardsWithParsedDesign);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received data:", data);

    const slug = generateSlug(
      `${data.brideName}-${data.groomName}-${Date.now()}`
    );

    const cardData = {
      slug,
      title: data.title || `${data.brideName} & ${data.groomName}'s Wedding`,
      description: data.description || null,
      brideName: data.brideName,
      groomName: data.groomName,
      weddingDate: new Date(data.weddingDate),
      weddingTime: data.weddingTime,
      venue: data.venue,
      venueAddress: data.venueAddress || null,
      rsvpDeadline: new Date(data.rsvpDeadline),
      maxGuests: data.maxGuests || 2,
      customQuestion: data.customQuestion || null,
      customQuestionType: data.customQuestionType || "text",
      customQuestionOptions: data.customQuestionOptions || null,
      rsvpFormConfig: data.rsvpFormConfig || null,
      registries: data.registries || null,
      eventDetailsConfig: data.eventDetailsConfig || null,
      design: JSON.stringify(data.design || {}),
      musicUrl: data.musicUrl || null,
      musicConfig: data.musicConfig || null,
      isPublished: false,
    };

    console.log("Creating card with data:", cardData);

    const card = await prisma.weddingCard.create({
      data: cardData,
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create card", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

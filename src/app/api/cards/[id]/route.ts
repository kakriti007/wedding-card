import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await prisma.weddingCard.findUnique({
      where: { id: params.id },
      include: {
        rsvps: {
          orderBy: { createdAt: "desc" },
        },
      },
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
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.brideName !== undefined) updateData.brideName = data.brideName;
    if (data.groomName !== undefined) updateData.groomName = data.groomName;
    if (data.weddingDate !== undefined)
      updateData.weddingDate = new Date(data.weddingDate);
    if (data.weddingTime !== undefined) updateData.weddingTime = data.weddingTime;
    if (data.venue !== undefined) updateData.venue = data.venue;
    if (data.venueAddress !== undefined)
      updateData.venueAddress = data.venueAddress;
    if (data.rsvpDeadline !== undefined)
      updateData.rsvpDeadline = new Date(data.rsvpDeadline);
    if (data.maxGuests !== undefined) updateData.maxGuests = data.maxGuests;
    if (data.customQuestion !== undefined)
      updateData.customQuestion = data.customQuestion;
    if (data.customQuestionType !== undefined)
      updateData.customQuestionType = data.customQuestionType;
    if (data.customQuestionOptions !== undefined)
      updateData.customQuestionOptions = data.customQuestionOptions;
    if (data.rsvpFormConfig !== undefined)
      updateData.rsvpFormConfig = data.rsvpFormConfig;
    if (data.registries !== undefined)
      updateData.registries = data.registries;
    if (data.eventDetailsConfig !== undefined)
      updateData.eventDetailsConfig = data.eventDetailsConfig;
    if (data.design !== undefined) updateData.design = JSON.stringify(data.design);
    if (data.musicUrl !== undefined) updateData.musicUrl = data.musicUrl;
    if (data.musicConfig !== undefined) updateData.musicConfig = data.musicConfig;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished;

    const card = await prisma.weddingCard.update({
      where: { id: params.id },
      data: updateData,
    });

    // Parse design string back to JSON
    const cardWithParsedDesign = {
      ...card,
      design: typeof card.design === 'string' ? JSON.parse(card.design) : card.design,
    };

    return NextResponse.json(cardWithParsedDesign);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.weddingCard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

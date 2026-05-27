import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRSVPNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const card = await prisma.weddingCard.findUnique({
      where: { slug: data.cardSlug },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (!card.isPublished) {
      return NextResponse.json(
        { error: "This invitation is not yet published" },
        { status: 403 }
      );
    }

    if (new Date() > card.rsvpDeadline) {
      return NextResponse.json(
        { error: "RSVP deadline has passed" },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        cardId: card.id,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        numberOfGuests: data.numberOfGuests || 1,
        attending: data.attending,
        customAnswer: data.customAnswer,
        message: data.message,
        dietaryRestrictions: data.dietaryRestrictions,
      },
    });

    try {
      await sendRSVPNotification({
        guestName: rsvp.guestName,
        guestEmail: rsvp.guestEmail,
        guestPhone: rsvp.guestPhone || undefined,
        numberOfGuests: rsvp.numberOfGuests,
        attending: rsvp.attending,
        customAnswer: rsvp.customAnswer || undefined,
        message: rsvp.message || undefined,
        dietaryRestrictions: rsvp.dietaryRestrictions || undefined,
        cardTitle: card.title,
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "RSVP submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 }
    );
  }
}

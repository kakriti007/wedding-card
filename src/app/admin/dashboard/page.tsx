"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Eye, Trash2, Users, ClipboardList } from "lucide-react";

interface WeddingCard {
  id: string;
  title: string;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  isPublished: boolean;
  _count: {
    rsvps: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [cards, setCards] = useState<WeddingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchCards();
    }
  }, [status, router]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wedding cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Card deleted successfully",
        });
        fetchCards();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wedding Cards Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome, {session?.user?.email}
            </p>
          </div>
          <Link href="/admin/cards/create">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Card
            </Button>
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💌</div>
            <h2 className="text-2xl font-semibold mb-2">No cards yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first wedding invitation card
            </p>
            <Link href="/admin/cards/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Card
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">💑</div>
                    <h3 className="font-bold text-lg">
                      {card.brideName} & {card.groomName}
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {new Date(card.weddingDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{card._count.rsvps} RSVPs</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        card.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {card.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {card._count.rsvps > 0 && (
                    <Link href={`/admin/cards/${card.id}/rsvps`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-blue-50 border-blue-300 hover:bg-blue-100"
                      >
                        <ClipboardList className="h-4 w-4 mr-1" />
                        View {card._count.rsvps} Response{card._count.rsvps !== 1 ? 's' : ''}
                      </Button>
                    </Link>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/admin/cards/${card.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/invite/${card.slug}`} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

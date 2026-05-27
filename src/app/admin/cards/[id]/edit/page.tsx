"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Eye, Save, Share2, ClipboardList, Settings } from "lucide-react";
import Link from "next/link";
import PageEditor, { Page } from "@/components/PageEditor";

interface WeddingCard {
  id: string;
  slug: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  isPublished: boolean;
  design: string | { pages: Page[] };
}

export default function EditCardPage() {
  const params = useParams();
  const cardId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [card, setCard] = useState<WeddingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<Page[]>([
    {
      id: "page-1",
      name: "Page 1",
      elements: [],
      background: { type: "color", value: "#fdf4ff" },
    },
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchCard();
    }
  }, [status, cardId]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}`);
      if (response.ok) {
        const data = await response.json();
        setCard(data);

        // Parse design
        let designData;
        if (typeof data.design === "string") {
          try {
            designData = JSON.parse(data.design);
          } catch {
            designData = { pages: [] };
          }
        } else {
          designData = data.design;
        }

        // Set pages from design or use default
        if (designData.pages && designData.pages.length > 0) {
          setPages(designData.pages);
        } else {
          // Create default page with some elements
          setPages([
            {
              id: "page-1",
              name: "Page 1",
              elements: [
                {
                  id: "el-1",
                  type: "couple-names",
                  x: 100,
                  y: 150,
                  width: 400,
                  height: 80,
                  styles: {
                    fontSize: 48,
                    fontFamily: "Inter",
                    color: "#9333ea",
                    fontWeight: "bold",
                    textAlign: "center",
                  },
                },
                {
                  id: "el-2",
                  type: "date",
                  x: 150,
                  y: 250,
                  width: 300,
                  height: 60,
                  styles: {
                    fontSize: 24,
                    fontFamily: "Inter",
                    color: "#ec4899",
                    textAlign: "center",
                  },
                },
                {
                  id: "el-3",
                  type: "venue",
                  x: 150,
                  y: 330,
                  width: 300,
                  height: 60,
                  styles: {
                    fontSize: 20,
                    fontFamily: "Inter",
                    color: "#1f2937",
                    textAlign: "center",
                  },
                },
              ],
              background: {
                type: "gradient",
                value: "",
                gradient: {
                  from: "#fdf4ff",
                  to: "#fce7f3",
                  direction: "to bottom",
                },
              },
            },
          ]);
        }
      } else {
        toast({
          title: "Error",
          description: "Card not found",
          variant: "destructive",
        });
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    setSaving(true);
    try {
      const designData = { pages };

      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design: designData }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Design saved successfully",
        });
        fetchCard();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save design",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!card) return;

    const newPublishState = !card.isPublished;

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newPublishState }),
      });

      if (response.ok) {
        toast({
          title: newPublishState ? "Published!" : "Unpublished",
          description: newPublishState
            ? "Your invitation is now live!"
            : "Your invitation is now private",
        });
        fetchCard();
      } else {
        throw new Error("Failed to update publish status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    }
  };

  const copyInvitationLink = () => {
    if (!card) return;
    const link = `${window.location.origin}/invite/${card.slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {card.brideName} & {card.groomName}
                </h1>
                <p className="text-sm text-gray-600">Visual Card Editor</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/admin/cards/${cardId}/settings`}>
                <Button variant="outline" className="bg-gray-50 border-gray-300 hover:bg-gray-100">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>

              <Link href={`/admin/cards/${cardId}/rsvps`}>
                <Button variant="outline" className="bg-blue-50 border-blue-300 hover:bg-blue-100">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View RSVPs
                </Button>
              </Link>

              <Button onClick={handleSaveDesign} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Design"}
              </Button>

              <Link href={`/invite/${card.slug}`} target="_blank">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>

              <Button
                variant={card.isPublished ? "secondary" : "default"}
                onClick={handlePublish}
                className={
                  !card.isPublished
                    ? "bg-gradient-to-r from-green-600 to-green-700"
                    : ""
                }
              >
                {card.isPublished ? "Unpublish" : "Publish"}
              </Button>

              {card.isPublished && (
                <Button
                  variant="outline"
                  onClick={copyInvitationLink}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              )}
            </div>
          </div>

          {/* Page Editor */}
          <div className="bg-white rounded-lg shadow-xl p-4">
            <PageEditor
              pages={pages}
              currentPageIndex={currentPageIndex}
              brideName={card.brideName}
              groomName={card.groomName}
              weddingDate={card.weddingDate}
              weddingTime={card.weddingTime}
              venue={card.venue}
              onPagesChange={setPages}
              onPageChange={setCurrentPageIndex}
            />
          </div>

          {/* Tips */}
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎨</div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-3 text-lg">Editor Controls:</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-purple-800">
                  <div className="space-y-2">
                    <div>✨ <strong>Drag & Drop:</strong> Click and drag elements to move</div>
                    <div>✏️ <strong>Edit Text:</strong> Click text element, then click again to edit</div>
                    <div>🗑️ <strong>Delete:</strong> Press Delete key or use trash icon</div>
                    <div>📐 <strong>Snap to Grid:</strong> Auto-aligns to 10px grid</div>
                  </div>
                  <div className="space-y-2">
                    <div>🖼️ <strong>Images:</strong> Upload then drag to position</div>
                    <div>📄 <strong>Pages:</strong> Add multiple pages in left panel</div>
                    <div>🎨 <strong>Background:</strong> Click canvas to change page background</div>
                    <div>💾 <strong>Save Often:</strong> Click "Save Design" button regularly</div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white/50 rounded border border-purple-200">
                  <p className="text-xs text-purple-700">
                    <strong>Pro Tip:</strong> Select an element to see styling options in the right panel.
                    Use the number inputs for precise positioning!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface RSVP {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  numberOfGuests: number;
  attending: boolean;
  customAnswer: string | null;
  message: string | null;
  dietaryRestrictions: string | null;
  createdAt: string;
}

interface WeddingCard {
  id: string;
  brideName: string;
  groomName: string;
  slug: string;
  customQuestion: string | null;
}

export default function RSVPDashboardPage() {
  const params = useParams();
  const cardId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [card, setCard] = useState<WeddingCard | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, cardId]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      // Fetch card details
      const cardResponse = await fetch(`/api/cards/${cardId}`);
      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        setCard(cardData);
      }

      // Fetch RSVPs
      const rsvpResponse = await fetch(`/api/cards/${cardId}/rsvps`);
      if (rsvpResponse.ok) {
        const rsvpData = await rsvpResponse.json();
        setRsvps(rsvpData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load RSVP data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportToExcel = () => {
    if (!card) return;

    // Prepare data for Excel
    const excelData = rsvps.map((rsvp) => ({
      Name: rsvp.guestName,
      Email: rsvp.guestEmail,
      Phone: rsvp.guestPhone || "N/A",
      Attending: rsvp.attending ? "Yes" : "No",
      "Number of Guests": rsvp.attending ? rsvp.numberOfGuests : 0,
      ...(card.customQuestion && {
        [card.customQuestion]: rsvp.customAnswer || "N/A",
      }),
      "Dietary Restrictions": rsvp.dietaryRestrictions || "N/A",
      Message: rsvp.message || "N/A",
      "RSVP Date": new Date(rsvp.createdAt).toLocaleDateString(),
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RSVPs");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
      wch: Math.min(
        Math.max(
          key.length,
          ...excelData.map((row) => String(row[key as keyof typeof row]).length)
        ),
        maxWidth
      ),
    }));
    ws["!cols"] = colWidths;

    // Download file
    const fileName = `${card.brideName}_${card.groomName}_RSVPs_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Success!",
      description: "RSVP data exported to Excel",
    });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading RSVP data...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const attendingCount = rsvps.filter((r) => r.attending).length;
  const decliningCount = rsvps.filter((r) => !r.attending).length;
  const totalGuestCount = rsvps
    .filter((r) => r.attending)
    .reduce((sum, r) => sum + r.numberOfGuests, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/admin/cards/${cardId}/edit`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  RSVP Responses
                </h1>
                <p className="text-sm text-gray-600">
                  {card.brideName} & {card.groomName}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchData}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={rsvps.length === 0}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-purple-600">{rsvps.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Attending</p>
              <p className="text-3xl font-bold text-green-600">
                {attendingCount}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
              <p className="text-sm text-gray-600">Declining</p>
              <p className="text-3xl font-bold text-gray-600">
                {decliningCount}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
              <p className="text-sm text-gray-600">Total Guests</p>
              <p className="text-3xl font-bold text-pink-600">
                {totalGuestCount}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {rsvps.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">No RSVPs Yet</h3>
                <p className="text-gray-600">
                  Responses will appear here once guests start submitting RSVPs
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        Attending
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        Guests
                      </th>
                      {card.customQuestion && (
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          {card.customQuestion}
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Dietary
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rsvps.map((rsvp, index) => (
                      <tr
                        key={rsvp.id}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {rsvp.guestName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {rsvp.guestEmail}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {rsvp.guestPhone || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {rsvp.attending ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ✗ No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {rsvp.attending ? rsvp.numberOfGuests : "-"}
                        </td>
                        {card.customQuestion && (
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {rsvp.customAnswer || "-"}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {rsvp.dietaryRestrictions || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {rsvp.message || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(rsvp.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Info */}
          {rsvps.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Click "Export to Excel" to download a
                spreadsheet with all RSVP data. The file includes all responses
                and can be opened in Excel, Google Sheets, or any spreadsheet
                application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

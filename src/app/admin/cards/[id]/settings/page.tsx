"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface WeddingCard {
  id: string;
  brideName: string;
  groomName: string;
  description?: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress?: string;
  rsvpDeadline: string;
  maxGuests: number;
  customQuestion?: string;
  customQuestionType?: string;
  customQuestionOptions?: string;
  musicUrl?: string;
  registries?: string;
  eventDetailsConfig?: string;
  rsvpFormConfig?: string;
}

export default function CardSettingsPage() {
  const params = useParams();
  const cardId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [card, setCard] = useState<WeddingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    description: "",
    weddingDate: "",
    weddingTime: "18:00",
    venue: "",
    venueAddress: "",
    rsvpDeadline: "",
    maxGuests: 2,
    customQuestion: "",
    customQuestionType: "text",
    musicUrl: "",
  });

  const [musicConfig, setMusicConfig] = useState({
    loop: true,
    autoplay: true,
    volume: 0.7,
  });

  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [registries, setRegistries] = useState<{ name: string; url: string; icon?: string }[]>([]);

  const [eventDetailsConfig, setEventDetailsConfig] = useState({
    showEventDetails: true,
    showMap: false,
    mapUrl: "",
    showMapLink: true,
  });

  const [rsvpFormConfig, setRsvpFormConfig] = useState({
    showPhone: true,
    phoneRequired: false,
    showDietaryRestrictions: true,
    showMessage: true,
    nameLabel: "Your Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    numberOfGuestsLabel: "Number of Guests",
    dietaryRestrictionsLabel: "Dietary Restrictions / Allergies",
    messageLabel: "Message for the Couple",
  });

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

        // Format dates for input fields
        const weddingDate = new Date(data.weddingDate).toISOString().split("T")[0];
        const rsvpDeadline = new Date(data.rsvpDeadline).toISOString().split("T")[0];

        setFormData({
          brideName: data.brideName,
          groomName: data.groomName,
          description: data.description || "",
          weddingDate,
          weddingTime: data.weddingTime,
          venue: data.venue,
          venueAddress: data.venueAddress || "",
          rsvpDeadline,
          maxGuests: data.maxGuests,
          customQuestion: data.customQuestion || "",
          customQuestionType: data.customQuestionType || "text",
          musicUrl: data.musicUrl || "",
        });

        if (data.customQuestionOptions) {
          setQuestionOptions(JSON.parse(data.customQuestionOptions));
        }

        if (data.registries) {
          setRegistries(JSON.parse(data.registries));
        }

        if (data.eventDetailsConfig) {
          setEventDetailsConfig(JSON.parse(data.eventDetailsConfig));
        }

        if (data.rsvpFormConfig) {
          setRsvpFormConfig(JSON.parse(data.rsvpFormConfig));
        }

        if (data.musicConfig) {
          setMusicConfig(JSON.parse(data.musicConfig));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        customQuestionOptions: questionOptions.length > 0 ? JSON.stringify(questionOptions) : null,
        rsvpFormConfig: JSON.stringify(rsvpFormConfig),
        registries: registries.length > 0 ? JSON.stringify(registries) : null,
        eventDetailsConfig: JSON.stringify(eventDetailsConfig),
        musicConfig: JSON.stringify(musicConfig),
      };

      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Settings saved successfully",
        });
        fetchCard();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/admin/cards/${cardId}/edit`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Editor
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Card Settings
            </h1>
            <p className="text-gray-600 mb-8">
              Update invitation details, RSVP settings, and more
            </p>

            <div className="space-y-6">
              {/* Basic Details */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Basic Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brideName">Bride's Name *</Label>
                    <Input
                      id="brideName"
                      value={formData.brideName}
                      onChange={(e) =>
                        setFormData({ ...formData, brideName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groomName">Groom's Name *</Label>
                    <Input
                      id="groomName"
                      value={formData.groomName}
                      onChange={(e) =>
                        setFormData({ ...formData, groomName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Event Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weddingDate">Wedding Date *</Label>
                    <Input
                      id="weddingDate"
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, weddingDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weddingTime">Wedding Time *</Label>
                    <Input
                      id="weddingTime"
                      type="time"
                      value={formData.weddingTime}
                      onChange={(e) =>
                        setFormData({ ...formData, weddingTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venueAddress">Venue Address</Label>
                    <Input
                      id="venueAddress"
                      value={formData.venueAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, venueAddress: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* RSVP Settings */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  RSVP Settings
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rsvpDeadline">RSVP Deadline *</Label>
                    <Input
                      id="rsvpDeadline"
                      type="date"
                      value={formData.rsvpDeadline}
                      onChange={(e) =>
                        setFormData({ ...formData, rsvpDeadline: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Max Guests per RSVP *</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min="1"
                      value={formData.maxGuests}
                      onChange={(e) =>
                        setFormData({ ...formData, maxGuests: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* Custom Question */}
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customQuestion">Custom Question (Optional)</Label>
                    <Input
                      id="customQuestion"
                      value={formData.customQuestion}
                      onChange={(e) =>
                        setFormData({ ...formData, customQuestion: e.target.value })
                      }
                      placeholder="e.g., Meal preference, Song requests"
                    />
                  </div>

                  {formData.customQuestion && (
                    <div className="space-y-3">
                      <Label>Question Type</Label>
                      <select
                        value={formData.customQuestionType}
                        onChange={(e) =>
                          setFormData({ ...formData, customQuestionType: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-md border"
                      >
                        <option value="text">Text (Free form)</option>
                        <option value="select">Dropdown (Select one)</option>
                        <option value="radio">Radio Buttons</option>
                      </select>

                      {(formData.customQuestionType === "select" ||
                        formData.customQuestionType === "radio") && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {questionOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...questionOptions];
                                  newOptions[index] = e.target.value;
                                  setQuestionOptions(newOptions);
                                }}
                                placeholder={`Option ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setQuestionOptions(
                                    questionOptions.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setQuestionOptions([...questionOptions, ""])}
                            className="w-full"
                          >
                            + Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RSVP Form Customization */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  RSVP Form Fields
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameLabel">Name Field Label</Label>
                      <Input
                        id="nameLabel"
                        value={rsvpFormConfig.nameLabel}
                        onChange={(e) =>
                          setRsvpFormConfig({ ...rsvpFormConfig, nameLabel: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailLabel">Email Field Label</Label>
                      <Input
                        id="emailLabel"
                        value={rsvpFormConfig.emailLabel}
                        onChange={(e) =>
                          setRsvpFormConfig({ ...rsvpFormConfig, emailLabel: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showPhone"
                        checked={rsvpFormConfig.showPhone}
                        onChange={(e) =>
                          setRsvpFormConfig({ ...rsvpFormConfig, showPhone: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showPhone" className="flex-1 cursor-pointer">
                        Show Phone Number Field
                      </Label>
                      {rsvpFormConfig.showPhone && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={rsvpFormConfig.phoneRequired}
                            onChange={(e) =>
                              setRsvpFormConfig({
                                ...rsvpFormConfig,
                                phoneRequired: e.target.checked,
                              })
                            }
                            className="w-3 h-3"
                          />
                          Required
                        </label>
                      )}
                    </div>
                    {rsvpFormConfig.showPhone && (
                      <Input
                        value={rsvpFormConfig.phoneLabel}
                        onChange={(e) =>
                          setRsvpFormConfig({ ...rsvpFormConfig, phoneLabel: e.target.value })
                        }
                        placeholder="Phone Number"
                        className="ml-7"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuestsLabel">Number of Guests Label</Label>
                    <Input
                      id="numberOfGuestsLabel"
                      value={rsvpFormConfig.numberOfGuestsLabel}
                      onChange={(e) =>
                        setRsvpFormConfig({
                          ...rsvpFormConfig,
                          numberOfGuestsLabel: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showDietaryRestrictions"
                        checked={rsvpFormConfig.showDietaryRestrictions}
                        onChange={(e) =>
                          setRsvpFormConfig({
                            ...rsvpFormConfig,
                            showDietaryRestrictions: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showDietaryRestrictions" className="flex-1 cursor-pointer">
                        Show Dietary Restrictions Field
                      </Label>
                    </div>
                    {rsvpFormConfig.showDietaryRestrictions && (
                      <Input
                        value={rsvpFormConfig.dietaryRestrictionsLabel}
                        onChange={(e) =>
                          setRsvpFormConfig({
                            ...rsvpFormConfig,
                            dietaryRestrictionsLabel: e.target.value,
                          })
                        }
                        placeholder="Dietary Restrictions / Allergies"
                        className="ml-7"
                      />
                    )}
                  </div>

                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showMessage"
                        checked={rsvpFormConfig.showMessage}
                        onChange={(e) =>
                          setRsvpFormConfig({
                            ...rsvpFormConfig,
                            showMessage: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showMessage" className="flex-1 cursor-pointer">
                        Show Message Field
                      </Label>
                    </div>
                    {rsvpFormConfig.showMessage && (
                      <Input
                        value={rsvpFormConfig.messageLabel}
                        onChange={(e) =>
                          setRsvpFormConfig({
                            ...rsvpFormConfig,
                            messageLabel: e.target.value,
                          })
                        }
                        placeholder="Message for the Couple"
                        className="ml-7"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Gift Registries */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Gift Registries
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add links to your wedding registries (Amazon, Target, Walmart, etc.)
                </p>

                <div className="space-y-3">
                  {registries.map((registry, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={registry.name}
                          onChange={(e) => {
                            const newRegistries = [...registries];
                            newRegistries[index].name = e.target.value;
                            setRegistries(newRegistries);
                          }}
                          placeholder="Registry name (e.g., Amazon, Target, Zola)"
                        />
                        <Input
                          value={registry.url}
                          onChange={(e) => {
                            const newRegistries = [...registries];
                            newRegistries[index].url = e.target.value;
                            setRegistries(newRegistries);
                          }}
                          placeholder="https://registry-url.com/your-registry"
                          type="url"
                        />
                        <Input
                          value={registry.icon || ""}
                          onChange={(e) => {
                            const newRegistries = [...registries];
                            newRegistries[index].icon = e.target.value;
                            setRegistries(newRegistries);
                          }}
                          placeholder="Emoji icon (optional, e.g., 🎁)"
                          maxLength={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRegistries(registries.filter((_, i) => i !== index));
                        }}
                        className="mt-1"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setRegistries([...registries, { name: "", url: "", icon: "🎁" }])
                    }
                    className="w-full"
                  >
                    + Add Registry
                  </Button>
                </div>
              </div>

              {/* Event Details Display */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Event Details Display
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure how event details appear to guests
                </p>

                <div className="space-y-4">
                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showEventDetails"
                        checked={eventDetailsConfig.showEventDetails}
                        onChange={(e) =>
                          setEventDetailsConfig({
                            ...eventDetailsConfig,
                            showEventDetails: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showEventDetails" className="flex-1 cursor-pointer">
                        Show Event Details Section (Date, Time, Location)
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-7">
                      Card width will automatically match your invitation design width
                    </p>
                  </div>

                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showMapLink"
                        checked={eventDetailsConfig.showMapLink}
                        onChange={(e) =>
                          setEventDetailsConfig({
                            ...eventDetailsConfig,
                            showMapLink: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showMapLink" className="flex-1 cursor-pointer">
                        Show "Open in Maps" Link
                      </Label>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showMap"
                        checked={eventDetailsConfig.showMap}
                        onChange={(e) =>
                          setEventDetailsConfig({
                            ...eventDetailsConfig,
                            showMap: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showMap" className="flex-1 cursor-pointer">
                        Show Google Maps Embed
                      </Label>
                    </div>
                    {eventDetailsConfig.showMap && (
                      <div className="ml-7 space-y-2">
                        <Input
                          value={eventDetailsConfig.mapUrl}
                          onChange={(e) =>
                            setEventDetailsConfig({
                              ...eventDetailsConfig,
                              mapUrl: e.target.value,
                            })
                          }
                          placeholder="Paste Google Maps embed URL"
                          type="url"
                        />
                        <p className="text-xs text-gray-500">
                          Go to Google Maps → Search location → Share → Embed a map → Copy the src URL from the iframe code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Music */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Music
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="musicUrl">Background Music URL</Label>
                    <Input
                      id="musicUrl"
                      type="url"
                      value={formData.musicUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, musicUrl: e.target.value })
                      }
                      placeholder="Spotify: https://open.spotify.com/track/... or MP3: https://example.com/music.mp3"
                    />
                    <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md">
                      <p className="font-semibold">✅ Supported:</p>
                      <p>• <strong>Spotify:</strong> Copy song link from Spotify (e.g., https://open.spotify.com/track/...)</p>
                      <p>• <strong>Spotify Playlist:</strong> Use playlist link for continuous playback</p>
                      <p>• <strong>Direct MP3:</strong> Direct link to .mp3 file</p>
                      <p className="font-semibold mt-2">How to get Spotify link:</p>
                      <p>1. Open Spotify → Find your song/playlist</p>
                      <p>2. Click ••• (three dots) → Share → Copy Song Link</p>
                      <p>3. Paste the link here</p>
                    </div>
                  </div>

                  {formData.musicUrl && !formData.musicUrl.includes('spotify.com') && (
                    <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
                      <Label className="text-sm font-semibold">Music Playback Settings (MP3 only)</Label>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="musicLoop"
                          checked={musicConfig.loop}
                          onChange={(e) =>
                            setMusicConfig({ ...musicConfig, loop: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="musicLoop" className="cursor-pointer">
                          Loop music (repeat continuously)
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="musicAutoplay"
                          checked={musicConfig.autoplay}
                          onChange={(e) =>
                            setMusicConfig({ ...musicConfig, autoplay: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="musicAutoplay" className="cursor-pointer">
                          Autoplay music (with user prompt)
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="musicVolume">
                          Volume: {Math.round(musicConfig.volume * 100)}%
                        </Label>
                        <input
                          type="range"
                          id="musicVolume"
                          min="0"
                          max="1"
                          step="0.1"
                          value={musicConfig.volume}
                          onChange={(e) =>
                            setMusicConfig({ ...musicConfig, volume: parseFloat(e.target.value) })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {formData.musicUrl && formData.musicUrl.includes('spotify.com') && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-md">
                      💡 <strong>Tip:</strong> Use a Spotify playlist link for continuous music playback instead of a single song!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save All Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

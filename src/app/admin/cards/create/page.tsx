"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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

  const [questionOptions, setQuestionOptions] = useState<string[]>([]);

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

  const [registries, setRegistries] = useState<
    { name: string; url: string; icon?: string }[]
  >([]);

  const [eventDetailsConfig, setEventDetailsConfig] = useState({
    showEventDetails: true,
    showMap: false,
    mapUrl: "",
    showMapLink: true,
  });

  const [musicConfig, setMusicConfig] = useState({
    loop: true,
    autoplay: true,
    volume: 0.7,
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/admin/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        customQuestionOptions: questionOptions.length > 0 ? JSON.stringify(questionOptions) : null,
        rsvpFormConfig: JSON.stringify(rsvpFormConfig),
        registries: registries.length > 0 ? JSON.stringify(registries) : null,
        eventDetailsConfig: JSON.stringify(eventDetailsConfig),
        musicConfig: JSON.stringify(musicConfig),
      };

      console.log("Submitting payload:", payload);

      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const card = await response.json();
        toast({
          title: "Success!",
          description: "Wedding card created successfully",
        });
        router.push(`/admin/cards/${card.id}/edit`);
      } else {
        const error = await response.json();
        console.error("API error:", error);
        throw new Error(error.error || error.message || "Failed to create card");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create card",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Wedding Invitation
            </h1>
            <p className="text-gray-600 mb-8">
              Fill in the details to create your beautiful invitation
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Couple Names */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brideName">Bride's Name *</Label>
                  <Input
                    id="brideName"
                    required
                    value={formData.brideName}
                    onChange={(e) =>
                      setFormData({ ...formData, brideName: e.target.value })
                    }
                    placeholder="Priya"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groomName">Groom's Name *</Label>
                  <Input
                    id="groomName"
                    required
                    value={formData.groomName}
                    onChange={(e) =>
                      setFormData({ ...formData, groomName: e.target.value })
                    }
                    placeholder="Raj"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Invitation Message</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Together with their families, request the honor of your presence..."
                  rows={3}
                />
              </div>

              {/* Wedding Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    required
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
                    required
                    value={formData.weddingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, weddingTime: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Venue Details */}
              <div className="space-y-2">
                <Label htmlFor="venue">Venue Name *</Label>
                <Input
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  placeholder="Grand Palace Banquet Hall"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Textarea
                  id="venueAddress"
                  value={formData.venueAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, venueAddress: e.target.value })
                  }
                  placeholder="123 Wedding Street, Mumbai, Maharashtra 400001"
                  rows={2}
                />
              </div>

              {/* RSVP Settings */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  RSVP Settings
                </h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rsvpDeadline">RSVP Deadline *</Label>
                      <Input
                        id="rsvpDeadline"
                        type="date"
                        required
                        value={formData.rsvpDeadline}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rsvpDeadline: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxGuests">Max Guests per RSVP *</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={formData.maxGuests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxGuests: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customQuestion">
                        Custom RSVP Question (Optional)
                      </Label>
                      <Input
                        id="customQuestion"
                        value={formData.customQuestion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customQuestion: e.target.value,
                          })
                        }
                        placeholder="e.g., Which events will you attend?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customQuestionType">Question Type</Label>
                      <select
                        id="customQuestionType"
                        value={formData.customQuestionType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customQuestionType: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="text">Text Input (Free form)</option>
                        <option value="select">Dropdown (Multiple Choice)</option>
                        <option value="radio">Radio Buttons (Multiple Choice)</option>
                      </select>
                    </div>

                    {(formData.customQuestionType === "select" ||
                      formData.customQuestionType === "radio") && (
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        <div className="space-y-2">
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
                            size="sm"
                            onClick={() =>
                              setQuestionOptions([...questionOptions, ""])
                            }
                            className="w-full"
                          >
                            + Add Option
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Add multiple choice options for guests to select from
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RSVP Form Customization */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  RSVP Form Fields
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Customize which fields appear in your RSVP form and their labels
                </p>

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
                  Add links to your wedding registries (Amazon, Target, Zola, etc.)
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
                  Music & Media
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="musicUrl">Background Music URL (Optional)</Label>
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
                      💡 <strong>Tip:</strong> Use a Spotify playlist link for continuous music playback instead of a single song! Spotify will autoplay automatically.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                >
                  {submitting ? "Creating..." : "Create Wedding Card"}
                </Button>
                <Link href="/admin/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            🎊 Indian Wedding Invitation
          </h1>
          <p className="text-xl text-gray-600">
            Create beautiful, customizable wedding invitations with RSVP
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
          <Link href="/admin/login">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Admin Login
            </Button>
          </Link>

          <Link href="/admin/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="pt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Features</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-2">🎨</div>
              <h3 className="font-semibold mb-2">Canva-like Editor</h3>
              <p className="text-sm text-gray-600">
                Customize colors, fonts, images, and layouts
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-2">💌</div>
              <h3 className="font-semibold mb-2">RSVP System</h3>
              <p className="text-sm text-gray-600">
                Collect responses with custom questions
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-2">🎵</div>
              <h3 className="font-semibold mb-2">Music & Media</h3>
              <p className="text-sm text-gray-600">
                Add background music and couple photos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

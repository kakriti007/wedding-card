"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [food, setFood] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        country,
        food,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Access Denied",
          description: "Invalid credentials. Please check your email and answers to the security questions.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: "Welcome!",
          description: "Login successful. Redirecting...",
        });
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎊 Admin Login
            </h1>
            <p className="text-gray-600">
              Enter your credentials to access the admin portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Where do you live?</Label>
              <Input
                id="country"
                type="password"
                placeholder="Your answer (case sensitive)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Hint: Answer should be in ALL CAPS
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food">What is your favourite food?</Label>
              <Input
                id="food"
                type="password"
                placeholder="Your answer (case sensitive)"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Hint: Include special characters if any
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>Only authorized admins can access this portal</p>
            <p className="text-xs text-gray-500">
              All fields are case-sensitive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

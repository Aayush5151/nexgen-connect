"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: POST /api/auth/send-otp
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    window.location.href = `/login/verify?phone=${encodeURIComponent(phone)}`;
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-off-white px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">Welcome Back</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Enter your phone number to receive an OTP.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="mt-8 rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-navy">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="flex h-10 items-center rounded-lg border border-border bg-off-white px-3 text-sm text-text-secondary">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="flex-1 rounded-lg border-border bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || phone.length < 10}
              className="mt-6 w-full rounded-lg bg-coral py-3 text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            New to NexGen Connect?{" "}
            <Link href="/signup" className="font-medium text-coral hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

"use client";
import { signIn, getSession } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function SignIn() {
  useEffect(() => {
    getSession().then((session) => {
      if (session) window.location.href = "/friends";
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
      <div className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FriendSync
        </h1>
        <Button
          onClick={() => signIn("discord")}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 text-lg font-semibold"
        >
          🚀 Continue with Discord
        </Button>
      </div>
    </div>
  );
}

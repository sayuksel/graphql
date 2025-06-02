"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Changed from email to identifier
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    console.log("Logging in with:", { identifier, password });
    try {
      await signIn(identifier, password); // Pass identifier instead of email
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button 
          type="submit" 
          className="bg-blue-600 text-white rounded p-3 hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}
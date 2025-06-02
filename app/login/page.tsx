"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    console.log("Logging in with:", { identifier, password });
    try {
      await signIn(identifier, password);
      router.push("/profile");
      console.log("Logging in with:", localStorage.getItem("jwt"));
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <form onSubmit={handleSubmit} className="rpg-block flex flex-col gap-4 max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold text-center mb-4 accent">CraftQL Guild Login</h1>
        <input
          type="text"
          placeholder="Adventurer Name or Email"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Secret Passphrase"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Enter Guild Hall</button>
      </form>
    </div>
  );
}
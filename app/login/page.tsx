"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // this is either username or email
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
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <svg width="32" height="32" fill="currentColor" className="text-white" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            CraftQL
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Your personal coding analytics dashboard
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Sign in to explore your programming journey
          </p>
        </div>
        
        {/* Login Form Card */}
        <div className="glass-card p-8 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Username or Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 text-red-200 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-4">
              <button type="submit" className="w-full btn-primary py-4 text-lg font-semibold">
                Sign In to Dashboard
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Secure authentication powered by GraphQL
            </p>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2025 CraftQL Dashboard. Built for developers, by developers.
          </p>
        </div>
      </div>
    </div>
  );
}
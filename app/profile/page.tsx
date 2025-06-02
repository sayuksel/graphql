"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, signOut } from "@/lib/auth";
import { graphqlQuery } from "@/lib/graphql";
import { GET_USER_PROFILE, GET_XP_TRANSACTIONS, GET_PROGRESS, GET_RESULTS } from "@/lib/queries";
import { User, Transaction, Progress, Result } from "@/lib/types";
import { processXPData, calculatePassFailRatio, extractSkills, calculateAuditRatio } from "@/lib/dataProcessing";

interface ProfileData {
  user: User;
  xpData: Array<{ date: Date; amount: number; cumulative: number; project: string }>;

  passFailRatio: { passed: number; failed: number; total: number; passRate: number };
  skills: string[];
  auditRatio: number;
  totalXP: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchProfileData();
  }, [router]);

  async function fetchProfileData() {
    try {
      setLoading(true);
      setError("");

      const userData = await graphqlQuery<{ user: User[] }>(GET_USER_PROFILE);
      
      if (!userData.user || userData.user.length === 0) {
        throw new Error("User not found");
      }

      const user = userData.user[0];
      const userId = user.id;

      const [xpData, progressData, resultsData] = await Promise.all([
        graphqlQuery<{ transaction: Transaction[] }>(GET_XP_TRANSACTIONS, { userId }),
        graphqlQuery<{ progress: Progress[] }>(GET_PROGRESS, { userId }),
        graphqlQuery<{ result: Result[] }>(GET_RESULTS, { userId })
      ]);

      const xpTransactions = xpData.transaction || [];
      const progress = progressData.progress || [];
      const results = resultsData.result || [];

      const processedXP = processXPData(xpTransactions);
      const passFailRatio = calculatePassFailRatio(progress);
      const skills = extractSkills(progress, results);
      const auditRatio = calculateAuditRatio(xpTransactions);
      const totalXP = processedXP.length > 0 ? processedXP[processedXP.length - 1].cumulative : 0;

      setProfile({
        user,
        xpData: processedXP,
        passFailRatio,
        skills,
        auditRatio,
        totalXP
      });

    } catch (err: any) {
      console.error("Error loading profile:", err);
      
      if (err.message.includes('Authentication') || err.message.includes('log in again')) {
        signOut();
        router.replace("/login");
        return;
      }
      
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-800 font-semibold mb-2">Error loading profile</h2>
        <p className="text-red-600">{error}</p>
        <div className="mt-4 flex gap-2">
          <button 
            onClick={fetchProfileData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
          <button 
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Chart calculations
  const maxXP = Math.max(...profile.xpData.map(d => d.cumulative));
  const xpPoints = profile.xpData.map((data, i) => {
    const x = (i / (profile.xpData.length - 1)) * 200;
    const y = 120 - (data.cumulative / maxXP) * 100;
    return `${x},${y}`;
  }).join(" ");

  const { passed, total } = profile.passFailRatio;
  const passAngle = total > 0 ? (passed / total) * 360 : 0;
  const failAngle = 360 - passAngle;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {profile.user.login}</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => {
            signOut();
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold text-blue-800">Total XP</h3>
          <p className="text-2xl font-bold text-blue-600">{profile.totalXP.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-semibold text-green-800">Pass Rate</h3>
          <p className="text-2xl font-bold text-green-600">{profile.passFailRatio.passRate.toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <h3 className="font-semibold text-purple-800">Audit Ratio</h3>
          <p className="text-2xl font-bold text-purple-600">{(profile.auditRatio * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Skills</h2>
        <div className="flex gap-2 flex-wrap">
          {profile.skills.map(skill => (
            <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-2">XP Progress</h2>
          <svg width="220" height="130" className="bg-gray-50 rounded p-2">
            {profile.xpData.length > 1 && (
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={xpPoints}
              />
            )}
            {profile.xpData.map((data, i) => (
              <circle
                key={i}
                cx={(i / (profile.xpData.length - 1)) * 200}
                cy={120 - (data.cumulative / maxXP) * 100}
                r="3"
                fill="#3b82f6"
              >
                <title>{`${data.project}: ${data.cumulative} XP`}</title>
              </circle>
            ))}
            <text x="5" y="125" fontSize="10" fill="#888">0</text>
            <text x="180" y="125" fontSize="10" fill="#888">Time</text>
            <text x="5" y="15" fontSize="10" fill="#888">{maxXP}</text>
          </svg>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Pass/Fail Ratio</h2>
          <svg width="120" height="120" viewBox="0 0 32 32">
            <circle
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              stroke="#22c55e"
              strokeWidth="32"
              strokeDasharray={`${passAngle} 360`}
              transform="rotate(-90 16 16)"
            />
            <circle
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="32"
              strokeDasharray={`${failAngle} 360`}
              strokeDashoffset={-passAngle}
              transform="rotate(-90 16 16)"
            />
            <text x="16" y="18" textAnchor="middle" fontSize="8" fill="#333">
              {profile.passFailRatio.passed}/{profile.passFailRatio.total}
            </text>
          </svg>
          <p className="text-sm text-gray-600 mt-2">
            {profile.passFailRatio.passed} passed, {profile.passFailRatio.failed} failed
          </p>
        </div>
      </div>
    </div>
  );
}
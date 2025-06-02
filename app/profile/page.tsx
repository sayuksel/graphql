"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, signOut } from "@/lib/auth";

// Dummy data for demonstration
const sampleProfile = {
  name: "Jane Doe",
  xp: [100, 200, 350, 500, 700],
  grades: [80, 85, 90, 95, 100],
  auditRatio: 0.92,
  skills: ["GraphQL", "React", "TypeScript"],
  projects: [
    { name: "Project A", passed: true },
    { name: "Project B", passed: false },
    { name: "Project C", passed: true },
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<typeof sampleProfile | null>(null);

  useEffect(() => {
    
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    setProfile(sampleProfile);
  }, [router]);

  if (!profile) return <div className="text-center mt-10">Loading...</div>;

  // SVG: XP over time (line graph)
  const xpPoints = profile.xp.map((xp, i) => `${i * 50},${120 - xp / 10}`).join(" ");
  // SVG: Pass/fail ratio (pie chart)
  const passCount = profile.projects.filter(p => p.passed).length;
  const failCount = profile.projects.length - passCount;
  const passAngle = (passCount / profile.projects.length) * 360;
  const failAngle = 360 - passAngle;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            signOut();
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* XP Over Time Graph */}
        <div>
          <h2 className="font-semibold mb-2">XP Over Time</h2>
          <svg width="220" height="130" className="bg-gray-50 rounded">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={xpPoints}
            />
            {profile.xp.map((xp, i) => (
              <circle
                key={i}
                cx={i * 50}
                cy={120 - xp / 10}
                r="4"
                fill="#3b82f6"
              />
            ))}
            <text x="0" y="125" fontSize="10" fill="#888">0</text>
            <text x="200" y="125" fontSize="10" fill="#888">Time</text>
            <text x="0" y="15" fontSize="10" fill="#888">XP</text>
          </svg>
        </div>

        {/* Pass/Fail Pie Chart */}
        <div>
          <h2 className="font-semibold mb-2">Project Pass/Fail Ratio</h2>
          <svg width="120" height="120" viewBox="0 0 32 32">
            {/* Pass slice */}
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
            {/* Fail slice */}
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
            <text x="16" y="18" textAnchor="middle" fontSize="10" fill="#333">
              {passCount} / {profile.projects.length} Passed
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold mb-2">Grades</h2>
        <div className="flex gap-4">
          {profile.grades.map((grade, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-lg font-bold">{grade}</span>
              <span className="text-xs text-gray-500">Test {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold mb-2">Audit Ratio</h2>
        <div className="text-xl">{(profile.auditRatio * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}
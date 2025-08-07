"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, signOut } from "@/lib/auth";
import { graphqlQuery } from "@/lib/graphql";
import { GET_USER_PROFILE, GET_XP_TRANSACTIONS, AUDITS_MADE, AUDITS_GOT } from "@/lib/queries";
import { User, Transaction, AuditsMade, AuditsGot } from "@/lib/types";
import { calculateAuditRatio, processAuditTimeSeriesData, processCompleteXPData } from "@/lib/dataProcessing";

interface ProfileData {
  user: User;
  xpData: Array<{ date: Date; amount: number; cumulative: number; project: string }>;
  auditRatio: number;
  totalXP: string;
  auditsMade: AuditsMade[];
  auditsGot: AuditsGot[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [hoveredAuditPoint, setHoveredAuditPoint] = useState<number | null>(null);
  const [hoveredXPPoint, setHoveredXPPoint] = useState<number | null>(null);

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

      const [xpData, auditsMadeData, auditsGotData] = await Promise.all([
        graphqlQuery<{ transaction: Transaction[] }>(GET_XP_TRANSACTIONS, { userId }),
        graphqlQuery<{ transaction: AuditsMade[] }>(AUDITS_MADE, { login: user.login }), 
        graphqlQuery<{ transaction: AuditsGot[] }>(AUDITS_GOT, { login: user.login })
      ]);

      // Extract data based on actual query structure
      const auditsMade = auditsMadeData?.transaction || [];
      const auditsGot = auditsGotData?.transaction || [];
      
      // Calculate total amounts from all audits made (down transactions)
      const auditsMadeTotalAmount = auditsMade.reduce((total: number, audit: AuditsMade) => {
        return total + (audit.amount || 0);
      }, 0);
      
      // Calculate total amounts from all audits got (up transactions)
      const auditsGotTotalAmount = auditsGot.reduce((total: number, audit: AuditsGot) => {
        return total + (audit.amount || 0);
      }, 0);
        
      const xpTransactions = xpData.transaction || [];

      // Process XP data with unit conversion using the utility function
      const xpProcessingResult = processCompleteXPData(xpTransactions);

      const auditRatio = calculateAuditRatio(auditsMadeTotalAmount, auditsGotTotalAmount);
      


      setProfile({
        user,
        xpData: xpProcessingResult.processedData,
        auditRatio: parseFloat(auditRatio),
        totalXP: xpProcessingResult.totalXPFormatted,
        auditsMade,
        auditsGot
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
  // Show only the most recent 20 XP points to avoid compression
  const displayedXPData = profile.xpData.length > 20 
    ? profile.xpData.slice(-20) 
    : profile.xpData;
  const maxXP = Math.max(...displayedXPData.map(d => d.cumulative));
  const xpPoints = displayedXPData.map((data, i) => {
    const x = (i / (displayedXPData.length - 1)) * 460; // Full width
    const y = 380 - (data.cumulative / maxXP) * 360; // Full height
    return `${x},${y}`;
  }).join(" ");

  // Process audit data for the time-based graph using the utility function
  const auditRatioData = processAuditTimeSeriesData(profile.auditsMade, profile.auditsGot);
  // Show only the most recent 20 audit points to avoid compression
  const displayedAuditData = auditRatioData.length > 20 
    ? auditRatioData.slice(-20) 
    : auditRatioData;
  const maxRatio = Math.max(...displayedAuditData.map(d => d.ratio), 2); // Minimum scale of 2
  const auditRatioPoints = displayedAuditData.map((data, i) => {
    const x = (i / (displayedAuditData.length - 1 || 1)) * 460; // Full width
    const y = 380 - (data.ratio / maxRatio) * 360; // Full height
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 mb-8 fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="mb-2">Welcome back, {profile.user.login}</h1>
              <p className="text-gray-300 text-lg">Ready to explore your coding journey?</p>
            </div>
            <button
              className="btn-danger"
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid slide-up">
          <div className="stat-card xp-card">
            <h3>Total Experience Points</h3>
            <div className="stat-value xp">{profile.totalXP}</div>
            <p className="text-gray-400 mt-2">XP earned across all projects</p>
          </div>
          <div className="stat-card audit-card">
            <h3>Audit Ratio</h3>
            <div className="stat-value audit">{profile.auditRatio.toFixed(1)}</div>
            <p className="text-gray-400 mt-2">Current audit performance</p>
          </div>
          <div className="stat-card user-card">
            <h3>Profile Information</h3>
            <div className="user-info mt-3 space-y-2">
              <p><strong>Name:</strong> {profile.user.firstName} {profile.user.lastName}</p>
              <p><strong>Username:</strong> {profile.user.login}</p>
              {profile.user.email && <p><strong>Email:</strong> {profile.user.email}</p>}
              <p><strong>User ID:</strong> {profile.user.id}</p>
              <p><strong>Member since:</strong> {new Date(profile.user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* XP Progress Chart */}
          <div className="chart-container">
            <h2>XP Progress Over Time</h2>
            <svg width="100%" height="400" viewBox="0 0 480 400" className="w-full">
              {displayedXPData.length > 1 && (
                <>
                  {/* Grid lines */}
                  <defs>
                    <pattern id="xpGrid" width="48" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 48 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <rect width="480" height="400" fill="url(#xpGrid)" />
                  
                  {/* XP Progress line */}
                  <polyline
                    fill="none"
                    stroke="url(#xpGradient)"
                    strokeWidth="5"
                    points={xpPoints}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' }}
                  />
                  
                  {/* Interactive points */}
                  {displayedXPData.map((data, i) => {
                    const x = (i / (displayedXPData.length - 1)) * 460;
                    const y = 380 - (data.cumulative / maxXP) * 360;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={hoveredXPPoint === i ? "8" : "5"}
                        fill="url(#xpGradient)"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="2"
                        style={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.2s ease',
                          filter: hoveredXPPoint === i ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' : 'none'
                        }}
                        onMouseEnter={() => setHoveredXPPoint(i)}
                        onMouseLeave={() => setHoveredXPPoint(null)}
                      >
                        <title>{`${data.project}: ${data.cumulative} XP`}</title>
                      </circle>
                    );
                  })}
                  
                  {/* Hover info display for XP */}
                  {hoveredXPPoint !== null && (
                    <g>
                      <rect
                        x="20"
                        y="20"
                        width="170"
                        height="85"
                        fill="rgba(0,0,0,0.9)"
                        rx="10"
                        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
                      />
                      <text x="35" y="45" fontSize="14" fill="#3b82f6" fontWeight="600">
                        {displayedXPData[hoveredXPPoint].date.toLocaleDateString()}
                      </text>
                      <text x="35" y="65" fontSize="12" fill="white">
                        Project: {displayedXPData[hoveredXPPoint].project.length > 18 
                          ? displayedXPData[hoveredXPPoint].project.substring(0, 18) + '...' 
                          : displayedXPData[hoveredXPPoint].project}
                      </text>
                      <text x="35" y="80" fontSize="12" fill="#10b981">
                        XP Gained: {displayedXPData[hoveredXPPoint].amount}
                      </text>
                      <text x="35" y="95" fontSize="12" fill="#8b5cf6">
                        Total XP: {displayedXPData[hoveredXPPoint].cumulative}
                      </text>
                    </g>
                  )}
                </>
              )}
              
              {displayedXPData.length <= 1 && (
                <text x="240" y="200" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.6)">
                  No XP data available
                </text>
              )}
              
              {/* Axis labels */}
              <text x="10" y="390" fontSize="14" fill="rgba(255,255,255,0.7)">Start</text>
              <text x="440" y="390" fontSize="14" fill="rgba(255,255,255,0.7)">Recent</text>
              <text x="20" y="25" fontSize="14" fill="rgba(255,255,255,0.7)">{profile.totalXP}</text>
              <text x="20" y="375" fontSize="14" fill="rgba(255,255,255,0.7)">0</text>
            </svg>
            <div className="mt-4 text-sm text-gray-300">
              <div className="flex justify-between items-center">
                <span>Total XP: <strong className="text-pink-400">{profile.totalXP}</strong></span>
                <span>Projects: <strong className="text-pink-400">{profile.xpData.length}</strong></span>
              </div>
              {profile.xpData.length > 20 && (
                <p className="text-pink-400 text-xs mt-1">Showing only last 20 projects</p>
              )}
            </div>
          </div>

          {/* Audit Ratio Over Time Chart */}
          <div className="chart-container">
            <h2>Audit Ratio Over Time</h2>
            <svg width="100%" height="400" viewBox="0 0 480 400" className="w-full">
              {displayedAuditData.length > 1 && (
                <>
                  {/* Grid lines */}
                  <defs>
                    <pattern id="auditGrid" width="48" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 48 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="auditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <rect width="480" height="400" fill="url(#auditGrid)" />
                  
                  {/* Audit ratio line */}
                  <polyline
                    fill="none"
                    stroke="url(#auditGradient)"
                    strokeWidth="5"
                    points={auditRatioPoints}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.6))' }}
                  />
                  
                  {/* Interactive points */}
                  {displayedAuditData.map((data, i) => {
                    const x = (i / (displayedAuditData.length - 1)) * 460;
                    const y = 380 - (data.ratio / maxRatio) * 360;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={hoveredAuditPoint === i ? "8" : "5"}
                        fill="url(#auditGradient)"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="2"
                        style={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.2s ease',
                          filter: hoveredAuditPoint === i ? 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.8))' : 'none'
                        }}
                        onMouseEnter={() => setHoveredAuditPoint(i)}
                        onMouseLeave={() => setHoveredAuditPoint(null)}
                      >
                        <title>
                          {`Date: ${data.date.toLocaleDateString()}\nRatio: ${Math.round(data.ratio)}\nAudits Made: ${Math.round(data.made)}\nAudits Got: ${Math.round(data.got)}`}
                        </title>
                      </circle>
                    );
                  })}
                  
                  {/* Hover info display */}
                  {hoveredAuditPoint !== null && (
                    <g>
                      <rect
                        x="20"
                        y="20"
                        width="200"
                        height="75"
                        fill="rgba(0,0,0,0.9)"
                        rx="10"
                        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
                      />
                      <text x="35" y="45" fontSize="14" fill="#8b5cf6" fontWeight="600">
                        {displayedAuditData[hoveredAuditPoint].date.toLocaleDateString()}
                      </text>
                      <text x="35" y="65" fontSize="12" fill="white">
                        Ratio: {displayedAuditData[hoveredAuditPoint].ratio.toFixed(2)}
                      </text>
                      <text x="35" y="80" fontSize="12" fill="#10b981">
                        Made: {Math.round(displayedAuditData[hoveredAuditPoint].made)} | Got: {Math.round(displayedAuditData[hoveredAuditPoint].got)}
                      </text>
                    </g>
                  )}
                </>
              )}
              
              {displayedAuditData.length <= 1 && (
                <text x="240" y="200" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.6)">
                  No audit data available
                </text>
              )}
              
              {/* Axis labels */}
              <text x="10" y="390" fontSize="14" fill="rgba(255,255,255,0.7)">Start</text>
              <text x="440" y="390" fontSize="14" fill="rgba(255,255,255,0.7)">Recent</text>
              <text x="20" y="25" fontSize="14" fill="rgba(255,255,255,0.7)">{profile.auditRatio.toFixed(1)}</text>
              <text x="20" y="375" fontSize="14" fill="rgba(255,255,255,0.7)">0</text>
            </svg>
            <div className="mt-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total audits made: <strong className="text-pink-400">{profile.auditsMade.length}</strong></span>
                  <span>Total audits got: <strong className="text-pink-400">{profile.auditsGot.length}</strong></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current ratio: <strong className="text-pink-400">{profile.auditRatio.toFixed(1)}</strong></span>
                  <span>Total audits: <strong className="text-pink-400">{profile.auditsMade.length + profile.auditsGot.length}</strong></span>
                </div>
              </div>
              {auditRatioData.length > 20 && (
                <p className="text-pink-400 text-xs mt-1">Showing only last 20 audits</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
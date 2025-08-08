import { Transaction, Progress } from './types';

export function processXPData(transactions: Transaction[]) {
  let cumulativeXP = 0;
  return transactions.map(tx => {
    cumulativeXP += tx.amount;
    return {
      date: new Date(tx.createdAt),
      amount: tx.amount,
      cumulative: cumulativeXP,
      project: tx.object.name
    };
  });
}

export function formatXPWithUnits(totalXP: number) {
  let value = "";
  let formattedXP = totalXP;
  switch (true) {
    case (totalXP >= 0 && totalXP < 1000):
      value = "B";
      break;
    case (totalXP >= 1000 && totalXP < 1000000):
      formattedXP = totalXP / 1000;
      value = "KB";
      break;
    case (totalXP >= 1000000 && totalXP < 1000000000):
      formattedXP = totalXP / 1000000;
      value = "MB";
      break;
    default:
      throw new Error("Total XP is out of expected range");
  }
  const finalValue = formattedXP;
  return {
    value: finalValue,
    unit: value,
    formatted: `${finalValue.toLocaleString()} ${value}`
  };
}

export function processCompleteXPData(transactions: Transaction[]) {
  // First process the transactions to get cumulative data
  const processedTransactions = processXPData(transactions);
  
  // Calculate total XP
  const totalXPRaw = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  
  // Format XP with units
  const formattedXP = formatXPWithUnits(totalXPRaw);
  
  return {
    processedData: processedTransactions,
    totalXP: formattedXP.value,
    totalXPFormatted: formattedXP.formatted,
    totalXPRaw: totalXPRaw,
    unit: formattedXP.unit
  };
}

export function calculatePassFailRatio(progress: Progress[]) {
  const passed = progress.filter(p => p.grade >= 1).length;
  const failed = progress.filter(p => p.grade === 0).length;
  const total = passed + failed;
  
  return {
    passed,
    failed,
    total,
    passRate: total > 0 ? (passed / total) * 100 : 0
  };
}

export function extractSkills(progress: Progress[]) {
  const skillsSet = new Set<string>();
  
  progress.forEach(p => {
    const pathParts = p.path.split('/');
    if (pathParts.length > 2) {
      skillsSet.add(pathParts[2]);
    }
  });
  
  return Array.from(skillsSet).filter(skill => skill && skill !== 'div-01');
}

export function calculateAuditRatio(auditsMade: number, auditsGot: number) {
  const auditRatio = auditsGot / (auditsMade || 1); // Avoid division by zero
  return auditRatio.toFixed(1); // Return as a string with 1 decimal place
}

export function processAuditTimeSeriesData(auditsMade: any[], auditsGot: any[]) {
  // Combine and sort all audit transactions by date
  const allAudits = [
    ...auditsMade.map(audit => ({ ...audit, type: 'made' as const })),
    ...auditsGot.map(audit => ({ ...audit, type: 'got' as const }))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Calculate running totals and ratios
  let runningMade = 0;
  let runningGot = 0;
  const auditRatioData: Array<{ date: Date; ratio: number; made: number; got: number }> = [];

  allAudits.forEach(audit => {
    if (audit.type === 'made') {
      runningMade += Math.abs(audit.amount);
    } else {
      runningGot += audit.amount;
    }
    
    const ratio = runningMade > 0 ? runningGot / runningMade : 0;
    auditRatioData.push({
      date: new Date(audit.createdAt),
      ratio,
      made: runningMade,
      got: runningGot
    });
  });

  return auditRatioData;
}
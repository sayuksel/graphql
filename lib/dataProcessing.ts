import { Transaction, Progress, Result } from './types';

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

export function extractSkills(progress: Progress[], results: Result[]) {
  const skillsSet = new Set<string>();
  
  // Extract from progress paths
  progress.forEach(p => {
    const pathParts = p.path.split('/');
    if (pathParts.length > 2) {
      skillsSet.add(pathParts[2]); // e.g., "graphql" from "/madere/div-01/graphql"
    }
  });
  
  // Extract from results paths
  results.forEach(r => {
    const pathParts = r.path.split('/');
    if (pathParts.length > 2) {
      skillsSet.add(pathParts[2]);
    }
  });
  
  return Array.from(skillsSet).filter(skill => skill && skill !== 'div-01');
}

export function calculateAuditRatio(transactions: Transaction[]) {
  const auditTransactions = transactions.filter(tx => tx.type === 'audit');
  // This is a simplified calculation - you might need to adjust based on your platform's logic
  return auditTransactions.length > 0 ? 0.85 : 0; // Placeholder logic
}
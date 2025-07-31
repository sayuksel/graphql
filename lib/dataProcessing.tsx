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

export function extractSkills(progress: Progress[]) {
  const skillsSet = new Set<string>();
  
  progress.forEach(p => {
    const pathParts = p.path.split('/');
    if (pathParts.length > 2) {
      skillsSet.add(pathParts[2]);
    }
  });
  
  // results.forEach(r => {
  //   const pathParts = r.path.split('/');
  //   if (pathParts.length > 2) {
  //     skillsSet.add(pathParts[2]);
  //   }
  // });
  
  return Array.from(skillsSet).filter(skill => skill && skill !== 'div-01');
}

export function calculateAuditRatio(auditsMade: number, auditsGot: number) {
  const auditRatio = auditsGot / (auditsMade || 1); // Avoid division by zero
  return auditRatio.toFixed(1); // Return as a string with 1 decimal place

}
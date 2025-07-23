import { Transaction } from './dataProcessor';

export interface WalletFeatures {
  wallet_address: string;
  total_transactions: number;
  deposit_count: number;
  borrow_count: number;
  repay_count: number;
  redeemunderlying_count: number;
  liquidationcall_count: number;
  deposit_ratio: number;
  borrow_ratio: number;
  repay_ratio: number;
  liquidation_ratio: number;
  total_amount: number;
  avg_amount: number;
  std_amount: number;
  amount_cv: number;
  unique_assets: number;
  asset_diversity_score: number;
  account_age_days: number;
  transactions_per_day: number;
  leverage_ratio: number;
  repayment_ratio: number;
  outstanding_debt: number;
  liquidation_count: number;
  time_regularity_score: number;
  transaction_complexity: number;
  gas_optimization_score: number;
  amount_uniformity_score: number;
}

export function engineerFeatures(transactions: Transaction[]): WalletFeatures[] {
  console.log('Engineering features from transaction data...');
  
  const walletGroups = transactions.reduce((groups, tx) => {
    if (!groups[tx.wallet_address]) {
      groups[tx.wallet_address] = [];
    }
    groups[tx.wallet_address].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const features = Object.entries(walletGroups).map(([walletAddress, walletTxs]) => {
    return extractWalletFeatures(walletAddress, walletTxs);
  });

  console.log(`Engineered features for ${features.length} wallets`);
  return features;
}

function extractWalletFeatures(walletAddress: string, transactions: Transaction[]): WalletFeatures {
  const actionCounts = transactions.reduce((counts, tx) => {
    counts[tx.action] = (counts[tx.action] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const totalTxs = transactions.length;
  const amounts = transactions.map(tx => tx.amount);
  const assets = new Set(transactions.map(tx => tx.asset));
  
  // Time analysis
  const timestamps = transactions.map(tx => new Date(tx.timestamp).getTime());
  const firstTx = Math.min(...timestamps);
  const lastTx = Math.max(...timestamps);
  const accountAgeDays = Math.max(1, (lastTx - firstTx) / (1000 * 60 * 60 * 24));

  // Financial calculations
  const deposits = transactions.filter(tx => tx.action === 'deposit');
  const borrows = transactions.filter(tx => tx.action === 'borrow');
  const repays = transactions.filter(tx => tx.action === 'repay');
  const liquidations = transactions.filter(tx => tx.action === 'liquidationcall');

  const totalDeposited = deposits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalBorrowed = borrows.reduce((sum, tx) => sum + tx.amount, 0);
  const totalRepaid = repays.reduce((sum, tx) => sum + tx.amount, 0);

  // Bot detection features
  const timeDiffs = timestamps.slice(1).map((time, i) => time - timestamps[i]);
  const timeRegularity = timeDiffs.length > 0 ? 
    1.0 / (standardDeviation(timeDiffs) / mean(timeDiffs) + 0.01) : 0;

  const amountCounts = amounts.reduce((counts, amount) => {
    counts[amount] = (counts[amount] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);
  const maxAmountCount = Math.max(...Object.values(amountCounts));
  const amountUniformity = maxAmountCount / amounts.length;

  // Gas optimization (if available)
  const gasUsedValues = transactions
    .map(tx => tx.gas_used)
    .filter(gas => gas !== undefined) as number[];
  const gasOptimization = gasUsedValues.length > 0 ? 
    (gasUsedValues.filter(gas => gasUsedValues.filter(g => g === gas).length > 1).length / gasUsedValues.length) : 0;

  return {
    wallet_address: walletAddress,
    total_transactions: totalTxs,
    deposit_count: actionCounts.deposit || 0,
    borrow_count: actionCounts.borrow || 0,
    repay_count: actionCounts.repay || 0,
    redeemunderlying_count: actionCounts.redeemunderlying || 0,
    liquidationcall_count: actionCounts.liquidationcall || 0,
    deposit_ratio: (actionCounts.deposit || 0) / totalTxs,
    borrow_ratio: (actionCounts.borrow || 0) / totalTxs,
    repay_ratio: (actionCounts.repay || 0) / totalTxs,
    liquidation_ratio: (actionCounts.liquidationcall || 0) / totalTxs,
    total_amount: amounts.reduce((sum, amount) => sum + amount, 0),
    avg_amount: mean(amounts),
    std_amount: standardDeviation(amounts),
    amount_cv: standardDeviation(amounts) / mean(amounts),
    unique_assets: assets.size,
    asset_diversity_score: 1.0 - (1.0 / assets.size),
    account_age_days: accountAgeDays,
    transactions_per_day: totalTxs / accountAgeDays,
    leverage_ratio: totalDeposited > 0 ? totalBorrowed / totalDeposited : 0,
    repayment_ratio: totalBorrowed > 0 ? totalRepaid / totalBorrowed : 1.0,
    outstanding_debt: Math.max(0, totalBorrowed - totalRepaid),
    liquidation_count: liquidations.length,
    time_regularity_score: timeRegularity,
    transaction_complexity: assets.size / totalTxs,
    gas_optimization_score: gasOptimization,
    amount_uniformity_score: amountUniformity
  };
}

function mean(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}
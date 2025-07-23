import { WalletFeatures } from './featureEngineer';

export interface ScoredWallet {
  wallet_address: string;
  credit_score: number;
  risk_category: string;
}

export interface ModelPackage {
  predict: (features: WalletFeatures[]) => number[];
  featureNames: string[];
}

export function trainModel(features: WalletFeatures[]): ModelPackage {
  console.log('Training credit scoring model...');
  
  // Create synthetic targets based on risk indicators
  const syntheticTargets = features.map(wallet => createSyntheticScore(wallet));
  
  // Simple model simulation (in real implementation, this would be XGBoost)
  const model: ModelPackage = {
    predict: (walletFeatures: WalletFeatures[]) => {
      return walletFeatures.map(wallet => createSyntheticScore(wallet));
    },
    featureNames: Object.keys(features[0]).filter(key => key !== 'wallet_address')
  };

  console.log('Model training completed');
  return model;
}

export function scoreWallets(model: ModelPackage, features: WalletFeatures[]): ScoredWallet[] {
  console.log(`Scoring ${features.length} wallets...`);
  
  const rawScores = model.predict(features);
  
  // Calibrate scores to 0-1000 range
  const calibratedScores = calibrateScores(rawScores);
  
  const scoredWallets = features.map((wallet, index) => ({
    wallet_address: wallet.wallet_address,
    credit_score: calibratedScores[index],
    risk_category: assignRiskCategory(calibratedScores[index])
  }));

  return scoredWallets.sort((a, b) => b.credit_score - a.credit_score);
}

function createSyntheticScore(wallet: WalletFeatures): number {
  let score = 500; // Base score
  
  // Positive factors
  score += wallet.repayment_ratio * 200; // Perfect repayment adds 200
  score += wallet.asset_diversity_score * 100; // Asset diversity adds 100
  score += Math.min(wallet.account_age_days / 365, 1) * 150; // Account age adds up to 150
  score += wallet.transaction_complexity * 50; // Complexity adds 50
  
  // Negative factors
  score -= wallet.liquidation_ratio * 300; // Liquidations reduce by 300
  score -= Math.min(wallet.leverage_ratio / 10, 1) * 200; // High leverage reduces score
  score -= Math.min(wallet.time_regularity_score / 5, 1) * 100; // Bot-like behavior
  score -= wallet.amount_uniformity_score * 150; // Uniform amounts suggest bots
  
  // Add some randomness for realistic distribution
  score += (Math.random() - 0.5) * 50;
  
  return Math.max(0, Math.min(1000, score));
}

function calibrateScores(rawScores: number[]): number[] {
  // Sort scores to calculate percentiles
  const sortedScores = [...rawScores].sort((a, b) => a - b);
  
  return rawScores.map(score => {
    // Find percentile rank
    const rank = sortedScores.findIndex(s => s >= score);
    const percentile = rank / sortedScores.length;
    
    // Map to 0-1000 range with slight curve
    return Math.round(percentile * 1000);
  });
}

function assignRiskCategory(score: number): string {
  if (score >= 900) return 'Excellent';
  if (score >= 800) return 'Very Good';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Fair';
  if (score >= 500) return 'Poor';
  if (score >= 400) return 'Very Poor';
  return 'Unacceptable';
}
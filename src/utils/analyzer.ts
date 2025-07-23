import { ScoredWallet } from './modelTrainer';
import { WalletFeatures } from './featureEngineer';

export interface AnalysisResult {
  score_distribution: {
    total_wallets: number;
    mean_score: number;
    median_score: number;
    std_score: number;
    min_score: number;
    max_score: number;
    bucket_distribution: Record<string, { count: number; percentage: number }>;
    risk_category_distribution: Record<string, { count: number; percentage: number }>;
  };
  behavioral_patterns: {
    high_score: any;
    medium_score: any;
    low_score: any;
  };
  risk_factors: {
    score_correlations: Record<string, number>;
    high_risk_characteristics: {
      count: number;
      avg_liquidations: number;
      avg_leverage: number;
      bot_like_ratio: number;
    };
  };
  comparative_analysis: {
    high_scorers: { count: number; score_range: string };
    low_scorers: { count: number; score_range: string };
    metric_differences: Record<string, {
      high_scorers_avg: number;
      low_scorers_avg: number;
      difference_ratio: number;
    }>;
  };
}

export function generateAnalysis(scores: ScoredWallet[], features: WalletFeatures[]): AnalysisResult {
  console.log('Generating comprehensive analysis...');
  
  const scoreValues = scores.map(s => s.credit_score);
  const totalWallets = scores.length;

  // Score distribution
  const scoreDistribution = {
    total_wallets: totalWallets,
    mean_score: mean(scoreValues),
    median_score: median(scoreValues),
    std_score: standardDeviation(scoreValues),
    min_score: Math.min(...scoreValues),
    max_score: Math.max(...scoreValues),
    bucket_distribution: calculateBucketDistribution(scoreValues),
    risk_category_distribution: calculateRiskCategoryDistribution(scores)
  };

  // Merge scores with features for analysis
  const mergedData = scores.map(score => {
    const walletFeatures = features.find(f => f.wallet_address === score.wallet_address);
    return { ...score, ...walletFeatures };
  });

  // Behavioral patterns
  const behavioralPatterns = analyzeBehavioralPatterns(mergedData);
  
  // Risk factors
  const riskFactors = analyzeRiskFactors(mergedData);
  
  // Comparative analysis
  const comparativeAnalysis = analyzeComparative(mergedData);

  return {
    score_distribution: scoreDistribution,
    behavioral_patterns: behavioralPatterns,
    risk_factors: riskFactors,
    comparative_analysis: comparativeAnalysis
  };
}

function calculateBucketDistribution(scores: number[]): Record<string, { count: number; percentage: number }> {
  const buckets: Record<string, { count: number; percentage: number }> = {};
  
  for (let i = 0; i < 10; i++) {
    const min = i * 100;
    const max = (i + 1) * 100 - 1;
    const key = `${min}-${max}`;
    const count = scores.filter(score => score >= min && score <= max).length;
    
    buckets[key] = {
      count,
      percentage: (count / scores.length) * 100
    };
  }
  
  return buckets;
}

function calculateRiskCategoryDistribution(scores: ScoredWallet[]): Record<string, { count: number; percentage: number }> {
  const categories: Record<string, number> = {};
  
  scores.forEach(score => {
    categories[score.risk_category] = (categories[score.risk_category] || 0) + 1;
  });
  
  const distribution: Record<string, { count: number; percentage: number }> = {};
  Object.entries(categories).forEach(([category, count]) => {
    distribution[category] = {
      count,
      percentage: (count / scores.length) * 100
    };
  });
  
  return distribution;
}

function analyzeBehavioralPatterns(mergedData: any[]) {
  const highScore = mergedData.filter(d => d.credit_score >= 700);
  const mediumScore = mergedData.filter(d => d.credit_score >= 400 && d.credit_score < 700);
  const lowScore = mergedData.filter(d => d.credit_score < 400);

  const analyzeGroup = (group: any[]) => {
    if (group.length === 0) return { count: 0 };
    
    return {
      count: group.length,
      total_transactions: { mean: mean(group.map(g => g.total_transactions || 0)) },
      account_age_days: { mean: mean(group.map(g => g.account_age_days || 0)) },
      repayment_ratio: { mean: mean(group.map(g => g.repayment_ratio || 0)) },
      leverage_ratio: { mean: mean(group.map(g => g.leverage_ratio || 0)) },
      asset_diversity_score: { mean: mean(group.map(g => g.asset_diversity_score || 0)) },
      liquidation_ratio: { mean: mean(group.map(g => g.liquidation_ratio || 0)) },
      transaction_complexity: { mean: mean(group.map(g => g.transaction_complexity || 0)) }
    };
  };

  return {
    high_score: analyzeGroup(highScore),
    medium_score: analyzeGroup(mediumScore),
    low_score: analyzeGroup(lowScore)
  };
}

function analyzeRiskFactors(mergedData: any[]) {
  // Calculate correlations with credit score
  const correlations: Record<string, number> = {};
  const riskFactors = [
    'liquidation_count', 'liquidation_ratio', 'leverage_ratio',
    'repayment_ratio', 'time_regularity_score', 'amount_uniformity_score'
  ];

  riskFactors.forEach(factor => {
    const scores = mergedData.map(d => d.credit_score);
    const factorValues = mergedData.map(d => d[factor] || 0);
    correlations[factor] = calculateCorrelation(scores, factorValues);
  });

  // High-risk characteristics
  const highRiskWallets = mergedData.filter(d => d.credit_score < 400);
  const highRiskChars = {
    count: highRiskWallets.length,
    avg_liquidations: mean(highRiskWallets.map(w => w.liquidation_count || 0)),
    avg_leverage: mean(highRiskWallets.map(w => w.leverage_ratio || 0)),
    bot_like_ratio: highRiskWallets.filter(w => (w.time_regularity_score || 0) > 2).length / highRiskWallets.length
  };

  return {
    score_correlations: correlations,
    high_risk_characteristics: highRiskChars
  };
}

function analyzeComparative(mergedData: any[]) {
  const sortedByScore = mergedData.sort((a, b) => b.credit_score - a.credit_score);
  const topPercentile = Math.floor(mergedData.length * 0.2);
  const bottomPercentile = Math.floor(mergedData.length * 0.2);
  
  const highScorers = sortedByScore.slice(0, topPercentile);
  const lowScorers = sortedByScore.slice(-bottomPercentile);

  const metrics = ['total_transactions', 'account_age_days', 'repayment_ratio', 'leverage_ratio'];
  const metricDifferences: Record<string, any> = {};

  metrics.forEach(metric => {
    const highAvg = mean(highScorers.map(h => h[metric] || 0));
    const lowAvg = mean(lowScorers.map(l => l[metric] || 0));
    
    metricDifferences[metric] = {
      high_scorers_avg: highAvg,
      low_scorers_avg: lowAvg,
      difference_ratio: lowAvg !== 0 ? highAvg / lowAvg : Infinity
    };
  });

  return {
    high_scorers: {
      count: highScorers.length,
      score_range: `${Math.min(...highScorers.map(h => h.credit_score))}-${Math.max(...highScorers.map(h => h.credit_score))}`
    },
    low_scorers: {
      count: lowScorers.length,
      score_range: `${Math.min(...lowScorers.map(l => l.credit_score))}-${Math.max(...lowScorers.map(l => l.credit_score))}`
    },
    metric_differences: metricDifferences
  };
}

function mean(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;
  
  for (let i = 0; i < x.length; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    
    numerator += deltaX * deltaY;
    sumXSquared += deltaX * deltaX;
    sumYSquared += deltaY * deltaY;
  }
  
  const denominator = Math.sqrt(sumXSquared * sumYSquared);
  return denominator === 0 ? 0 : numerator / denominator;
}
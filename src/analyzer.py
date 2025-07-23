"""
Analysis module for generating comprehensive reports on wallet scoring results.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import logging
from typing import Dict, List, Any

class ScoreAnalyzer:
    """Analyzes wallet scoring results and generates comprehensive reports."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        plt.style.use('seaborn-v0_8')
    
    def generate_comprehensive_analysis(self, scores_df: pd.DataFrame, features_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate comprehensive analysis of scoring results.
        
        Args:
            scores_df: DataFrame with wallet scores
            features_df: DataFrame with engineered features
            
        Returns:
            Dictionary containing analysis results
        """
        self.logger.info("Generating comprehensive analysis...")
        
        analysis = {}
        
        # Score distribution analysis
        analysis['score_distribution'] = self._analyze_score_distribution(scores_df)
        
        # Behavioral pattern analysis
        analysis['behavioral_patterns'] = self._analyze_behavioral_patterns(scores_df, features_df)
        
        # Risk factor analysis
        analysis['risk_factors'] = self._analyze_risk_factors(scores_df, features_df)
        
        # Comparative analysis
        analysis['comparative_analysis'] = self._comparative_analysis(scores_df, features_df)
        
        return analysis
    
    def _analyze_score_distribution(self, scores_df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze the distribution of credit scores."""
        scores = scores_df['credit_score']
        
        # Basic statistics
        distribution = {
            'total_wallets': len(scores),
            'mean_score': scores.mean(),
            'median_score': scores.median(),
            'std_score': scores.std(),
            'min_score': scores.min(),
            'max_score': scores.max(),
            'quartiles': {
                'q1': scores.quantile(0.25),
                'q2': scores.quantile(0.50),
                'q3': scores.quantile(0.75)
            }
        }
        
        # Score buckets (0-100, 100-200, etc.)
        bins = np.arange(0, 1001, 100)
        bucket_labels = [f"{bins[i]}-{bins[i+1]-1}" for i in range(len(bins)-1)]
        bucket_counts = pd.cut(scores, bins=bins, labels=bucket_labels, include_lowest=True).value_counts()
        
        distribution['bucket_distribution'] = {}
        for bucket, count in bucket_counts.items():
            percentage = (count / len(scores)) * 100
            distribution['bucket_distribution'][str(bucket)] = {
                'count': int(count),
                'percentage': round(percentage, 2)
            }
        
        # Risk category distribution
        category_counts = scores_df['risk_category'].value_counts()
        distribution['risk_category_distribution'] = {}
        for category, count in category_counts.items():
            percentage = (count / len(scores)) * 100
            distribution['risk_category_distribution'][category] = {
                'count': int(count),
                'percentage': round(percentage, 2)
            }
        
        return distribution
    
    def _analyze_behavioral_patterns(self, scores_df: pd.DataFrame, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze behavioral patterns across different score ranges."""
        # Merge scores with features
        merged_df = pd.merge(scores_df, features_df, on='wallet_address')
        
        patterns = {}
        
        # Define score groups
        score_groups = {
            'high_score': merged_df[merged_df['credit_score'] >= 700],
            'medium_score': merged_df[(merged_df['credit_score'] >= 400) & (merged_df['credit_score'] < 700)],
            'low_score': merged_df[merged_df['credit_score'] < 400]
        }
        
        # Analyze key behavioral metrics for each group
        behavioral_metrics = [
            'total_transactions', 'liquidation_ratio', 'repayment_ratio',
            'leverage_ratio', 'asset_diversity_score', 'account_age_days',
            'time_regularity_score', 'transaction_complexity'
        ]
        
        for group_name, group_data in score_groups.items():
            if len(group_data) > 0:
                patterns[group_name] = {}
                patterns[group_name]['count'] = len(group_data)
                
                for metric in behavioral_metrics:
                    if metric in group_data.columns:
                        patterns[group_name][metric] = {
                            'mean': float(group_data[metric].mean()),
                            'median': float(group_data[metric].median()),
                            'std': float(group_data[metric].std())
                        }
        
        return patterns
    
    def _analyze_risk_factors(self, scores_df: pd.DataFrame, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze key risk factors and their correlation with scores."""
        merged_df = pd.merge(scores_df, features_df, on='wallet_address')
        
        risk_factors = {}
        
        # Key risk indicators
        risk_indicators = [
            'liquidation_count', 'liquidation_ratio', 'leverage_ratio',
            'outstanding_debt', 'repayment_ratio', 'time_regularity_score',
            'amount_uniformity_score', 'gas_optimization_score'
        ]
        
        correlations = {}
        for indicator in risk_indicators:
            if indicator in merged_df.columns:
                correlation = merged_df['credit_score'].corr(merged_df[indicator])
                correlations[indicator] = float(correlation) if not np.isnan(correlation) else 0.0
        
        risk_factors['score_correlations'] = correlations
        
        # High-risk wallet analysis
        high_risk_wallets = merged_df[merged_df['credit_score'] < 400]
        if len(high_risk_wallets) > 0:
            risk_factors['high_risk_characteristics'] = {
                'count': len(high_risk_wallets),
                'avg_liquidations': float(high_risk_wallets['liquidation_count'].mean()) if 'liquidation_count' in high_risk_wallets.columns else 0,
                'avg_leverage': float(high_risk_wallets['leverage_ratio'].mean()) if 'leverage_ratio' in high_risk_wallets.columns else 0,
                'bot_like_ratio': float((high_risk_wallets['time_regularity_score'] > 2).mean()) if 'time_regularity_score' in high_risk_wallets.columns else 0
            }
        
        return risk_factors
    
    def _comparative_analysis(self, scores_df: pd.DataFrame, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Compare high-scoring vs low-scoring wallets."""
        merged_df = pd.merge(scores_df, features_df, on='wallet_address')
        
        # Define comparison groups
        high_score_threshold = merged_df['credit_score'].quantile(0.8)
        low_score_threshold = merged_df['credit_score'].quantile(0.2)
        
        high_scorers = merged_df[merged_df['credit_score'] >= high_score_threshold]
        low_scorers = merged_df[merged_df['credit_score'] <= low_score_threshold]
        
        comparison = {
            'high_scorers': {
                'count': len(high_scorers),
                'score_range': f"{high_scorers['credit_score'].min():.0f}-{high_scorers['credit_score'].max():.0f}"
            },
            'low_scorers': {
                'count': len(low_scorers),
                'score_range': f"{low_scorers['credit_score'].min():.0f}-{low_scorers['credit_score'].max():.0f}"
            }
        }
        
        # Compare key metrics
        comparison_metrics = [
            'total_transactions', 'account_age_days', 'unique_assets',
            'repayment_ratio', 'liquidation_ratio', 'leverage_ratio'
        ]
        
        comparison['metric_differences'] = {}
        for metric in comparison_metrics:
            if metric in merged_df.columns:
                high_avg = high_scorers[metric].mean() if len(high_scorers) > 0 else 0
                low_avg = low_scorers[metric].mean() if len(low_scorers) > 0 else 0
                
                comparison['metric_differences'][metric] = {
                    'high_scorers_avg': float(high_avg),
                    'low_scorers_avg': float(low_avg),
                    'difference_ratio': high_avg / low_avg if low_avg != 0 else float('inf')
                }
        
        return comparison
    
    def generate_markdown_report(self, analysis: Dict[str, Any]) -> str:
        """Generate a markdown report from analysis results."""
        report = "# DeFi Credit Scoring Analysis Report\n\n"
        
        # Executive Summary
        report += "## Executive Summary\n\n"
        dist = analysis['score_distribution']
        report += f"This analysis covers **{dist['total_wallets']:,}** wallets with an average credit score of **{dist['mean_score']:.0f}**.\n\n"
        
        # Score Distribution
        report += "## Score Distribution\n\n"
        report += f"- **Mean Score**: {dist['mean_score']:.2f}\n"
        report += f"- **Median Score**: {dist['median_score']:.2f}\n"
        report += f"- **Standard Deviation**: {dist['std_score']:.2f}\n"
        report += f"- **Score Range**: {dist['min_score']:.0f} - {dist['max_score']:.0f}\n\n"
        
        # Bucket Distribution
        report += "### Score Distribution by Buckets\n\n"
        report += "| Score Range | Count | Percentage |\n"
        report += "|-------------|-------|------------|\n"
        
        for bucket, data in dist['bucket_distribution'].items():
            report += f"| {bucket} | {data['count']:,} | {data['percentage']:.1f}% |\n"
        
        report += "\n"
        
        # Risk Categories
        report += "### Risk Category Distribution\n\n"
        report += "| Risk Category | Count | Percentage |\n"
        report += "|---------------|-------|------------|\n"
        
        for category, data in dist['risk_category_distribution'].items():
            report += f"| {category} | {data['count']:,} | {data['percentage']:.1f}% |\n"
        
        report += "\n"
        
        # Behavioral Patterns
        if 'behavioral_patterns' in analysis:
            report += "## Behavioral Pattern Analysis\n\n"
            patterns = analysis['behavioral_patterns']
            
            for group_name, group_data in patterns.items():
                if isinstance(group_data, dict) and 'count' in group_data:
                    report += f"### {group_name.replace('_', ' ').title()} ({group_data['count']} wallets)\n\n"
                    
                    for metric, stats in group_data.items():
                        if metric != 'count' and isinstance(stats, dict):
                            report += f"- **{metric.replace('_', ' ').title()}**: {stats['mean']:.2f} (avg), {stats['median']:.2f} (median)\n"
                    
                    report += "\n"
        
        # Risk Factor Analysis
        if 'risk_factors' in analysis:
            report += "## Risk Factor Analysis\n\n"
            risk_factors = analysis['risk_factors']
            
            if 'score_correlations' in risk_factors:
                report += "### Risk Factor Correlations with Credit Score\n\n"
                report += "| Risk Factor | Correlation |\n"
                report += "|-------------|-------------|\n"
                
                sorted_correlations = sorted(risk_factors['score_correlations'].items(), 
                                           key=lambda x: abs(x[1]), reverse=True)
                
                for factor, correlation in sorted_correlations:
                    report += f"| {factor.replace('_', ' ').title()} | {correlation:.3f} |\n"
                
                report += "\n"
        
        # Comparative Analysis
        if 'comparative_analysis' in analysis:
            report += "## High vs Low Scorer Comparison\n\n"
            comp = analysis['comparative_analysis']
            
            report += f"- **High Scorers**: {comp['high_scorers']['count']} wallets (scores {comp['high_scorers']['score_range']})\n"
            report += f"- **Low Scorers**: {comp['low_scorers']['count']} wallets (scores {comp['low_scorers']['score_range']})\n\n"
            
            if 'metric_differences' in comp:
                report += "### Key Metric Differences\n\n"
                report += "| Metric | High Scorers | Low Scorers | Ratio |\n"
                report += "|--------|--------------|-------------|-------|\n"
                
                for metric, data in comp['metric_differences'].items():
                    ratio_str = f"{data['difference_ratio']:.2f}x" if data['difference_ratio'] != float('inf') else "∞"
                    report += f"| {metric.replace('_', ' ').title()} | {data['high_scorers_avg']:.2f} | {data['low_scorers_avg']:.2f} | {ratio_str} |\n"
        
        report += "\n---\n\n*Report generated by DeFi Credit Scoring System*\n"
        
        return report
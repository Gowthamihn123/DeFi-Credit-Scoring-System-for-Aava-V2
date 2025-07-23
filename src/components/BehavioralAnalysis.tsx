import React from 'react';
import { Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface BehavioralAnalysisProps {
  analysis: any;
}

export function BehavioralAnalysis({ analysis }: BehavioralAnalysisProps) {
  const behavioralPatterns = analysis?.behavioral_patterns || {};
  const comparative = analysis?.comparative_analysis || {};

  const scoreGroups = [
    { key: 'high_score', label: 'High Scorers (700+)', color: 'green', icon: TrendingUp },
    { key: 'medium_score', label: 'Medium Scorers (400-699)', color: 'yellow', icon: Activity },
    { key: 'low_score', label: 'Low Scorers (<400)', color: 'red', icon: TrendingDown }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-500 to-emerald-500 text-green-700 bg-green-50';
      case 'yellow': return 'from-yellow-500 to-orange-500 text-yellow-700 bg-yellow-50';
      case 'red': return 'from-red-500 to-pink-500 text-red-700 bg-red-50';
      default: return 'from-slate-500 to-slate-600 text-slate-700 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Behavioral Analysis</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Comprehensive analysis of behavioral patterns across different credit score segments
        </p>
      </div>

      {/* Score Group Analysis */}
      <div className="grid lg:grid-cols-3 gap-6">
        {scoreGroups.map(group => {
          const groupData = behavioralPatterns[group.key];
          const Icon = group.icon;
          const colorClasses = getColorClasses(group.color);
          
          if (!groupData) return null;

          return (
            <div key={group.key} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{group.label}</h3>
                  <p className="text-sm text-slate-600">{groupData.count} wallets</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {groupData.total_transactions && (
                    <div className={`p-3 rounded-lg ${colorClasses.split(' ').slice(2).join(' ')}`}>
                      <div className="text-xs font-medium opacity-75 mb-1">Avg Transactions</div>
                      <div className="text-lg font-bold">{groupData.total_transactions.mean?.toFixed(0) || 'N/A'}</div>
                    </div>
                  )}
                  
                  {groupData.account_age_days && (
                    <div className={`p-3 rounded-lg ${colorClasses.split(' ').slice(2).join(' ')}`}>
                      <div className="text-xs font-medium opacity-75 mb-1">Avg Age (Days)</div>
                      <div className="text-lg font-bold">{groupData.account_age_days.mean?.toFixed(0) || 'N/A'}</div>
                    </div>
                  )}
                  
                  {groupData.repayment_ratio && (
                    <div className={`p-3 rounded-lg ${colorClasses.split(' ').slice(2).join(' ')}`}>
                      <div className="text-xs font-medium opacity-75 mb-1">Repayment Ratio</div>
                      <div className="text-lg font-bold">{(groupData.repayment_ratio.mean * 100)?.toFixed(1) || 'N/A'}%</div>
                    </div>
                  )}
                  
                  {groupData.leverage_ratio && (
                    <div className={`p-3 rounded-lg ${colorClasses.split(' ').slice(2).join(' ')}`}>
                      <div className="text-xs font-medium opacity-75 mb-1">Leverage Ratio</div>
                      <div className="text-lg font-bold">{groupData.leverage_ratio.mean?.toFixed(2) || 'N/A'}</div>
                    </div>
                  )}
                </div>

                {/* Additional Metrics */}
                <div className="space-y-2 text-sm">
                  {groupData.asset_diversity_score && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Asset Diversity:</span>
                      <span className="font-medium">{(groupData.asset_diversity_score.mean * 100)?.toFixed(1) || 'N/A'}%</span>
                    </div>
                  )}
                  
                  {groupData.liquidation_ratio && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Liquidation Rate:</span>
                      <span className="font-medium">{(groupData.liquidation_ratio.mean * 100)?.toFixed(2) || 'N/A'}%</span>
                    </div>
                  )}
                  
                  {groupData.transaction_complexity && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Complexity Score:</span>
                      <span className="font-medium">{groupData.transaction_complexity.mean?.toFixed(3) || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Analysis */}
      {comparative.metric_differences && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">High vs Low Scorer Comparison</h3>
              <p className="text-slate-600">Key behavioral differences between top and bottom performers</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">High Scorers</h4>
              <p className="text-sm text-green-700">
                {comparative.high_scorers?.count || 0} wallets with scores {comparative.high_scorers?.score_range || 'N/A'}
              </p>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Low Scorers</h4>
              <p className="text-sm text-red-700">
                {comparative.low_scorers?.count || 0} wallets with scores {comparative.low_scorers?.score_range || 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Metric Differences</h4>
            <div className="grid gap-4">
              {Object.entries(comparative.metric_differences).map(([metric, data]: [string, any]) => (
                <div key={metric} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800 capitalize">
                      {metric.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-slate-600">
                      High: {data.high_scorers_avg?.toFixed(2) || 'N/A'} | Low: {data.low_scorers_avg?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      data.difference_ratio > 2 ? 'text-green-600' :
                      data.difference_ratio > 1.5 ? 'text-blue-600' :
                      data.difference_ratio > 1 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.difference_ratio === Infinity ? '∞' : `${data.difference_ratio?.toFixed(1) || 'N/A'}x`}
                    </div>
                    <div className="text-xs text-slate-500">Ratio</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
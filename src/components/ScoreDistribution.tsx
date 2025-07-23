import React from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

interface ScoreDistributionProps {
  scores: Array<{ credit_score: number; risk_category: string }>;
}

export function ScoreDistribution({ scores }: ScoreDistributionProps) {
  // Calculate distribution by buckets
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 100}-${(i + 1) * 100 - 1}`,
    min: i * 100,
    max: (i + 1) * 100 - 1,
    count: 0,
    percentage: 0
  }));

  scores.forEach(score => {
    const bucketIndex = Math.min(Math.floor(score.credit_score / 100), 9);
    buckets[bucketIndex].count++;
  });

  buckets.forEach(bucket => {
    bucket.percentage = (bucket.count / scores.length) * 100;
  });

  // Risk category distribution
  const riskCategories = scores.reduce((acc, score) => {
    acc[score.risk_category] = (acc[score.risk_category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...buckets.map(b => b.count));
  const avgScore = scores.reduce((sum, s) => sum + s.credit_score, 0) / scores.length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Score Distribution</h3>
          <p className="text-slate-600">Credit score analysis across all wallets</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Wallets</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{scores.length.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Average Score</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{avgScore.toFixed(0)}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Score Range</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {Math.min(...scores.map(s => s.credit_score)).toFixed(0)}-{Math.max(...scores.map(s => s.credit_score)).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="mb-8">
        <h4 className="font-semibold text-slate-800 mb-4">Distribution by Score Buckets</h4>
        <div className="space-y-3">
          {buckets.map((bucket, index) => (
            <div key={bucket.range} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-slate-600">
                {bucket.range}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 delay-${index * 100} ${
                    index < 3 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                    index < 6 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-700">
                    {bucket.count} ({bucket.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Categories */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-4">Risk Category Distribution</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(riskCategories).map(([category, count]) => {
            const percentage = (count / scores.length) * 100;
            const colorClass = 
              category === 'Excellent' || category === 'Very Good' ? 'from-green-500 to-emerald-500' :
              category === 'Good' || category === 'Fair' ? 'from-yellow-500 to-orange-500' :
              'from-red-500 to-pink-500';
            
            return (
              <div key={category} className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">{category}</span>
                  <span className="text-sm text-slate-600">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{count} wallets</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
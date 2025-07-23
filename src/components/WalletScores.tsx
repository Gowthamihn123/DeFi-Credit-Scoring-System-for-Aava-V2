import React, { useState } from 'react';
import { Wallet, Star, AlertTriangle, TrendingUp, Search } from 'lucide-react';

interface WalletScoresProps {
  scores: Array<{
    wallet_address: string;
    credit_score: number;
    risk_category: string;
  }>;
}

export function WalletScores({ scores }: WalletScoresProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'address'>('score');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredScores = scores
    .filter(score => 
      score.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || score.risk_category === filterCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.credit_score - a.credit_score;
      }
      return a.wallet_address.localeCompare(b.wallet_address);
    });

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'Excellent': return 'text-green-700 bg-green-100';
      case 'Very Good': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      case 'Poor': return 'text-orange-600 bg-orange-50';
      case 'Very Poor': return 'text-red-600 bg-red-50';
      case 'Unacceptable': return 'text-red-700 bg-red-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-700';
    if (score >= 600) return 'text-blue-600';
    if (score >= 400) return 'text-yellow-600';
    return 'text-red-600';
  };

  const uniqueCategories = [...new Set(scores.map(s => s.risk_category))];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Top Wallet Scores</h3>
          <p className="text-slate-600">Highest performing wallets by credit score</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'address')}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="score">Sort by Score</option>
          <option value="address">Sort by Address</option>
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Wallet List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredScores.slice(0, 20).map((score, index) => (
          <div
            key={score.wallet_address}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {index < 3 && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-slate-300 text-slate-700' :
                    'bg-orange-400 text-orange-900'
                  }`}>
                    {index + 1}
                  </div>
                )}
                <Wallet className="w-5 h-5 text-slate-500" />
              </div>
              
              <div>
                <div className="font-mono text-sm text-slate-800">
                  {score.wallet_address.slice(0, 6)}...{score.wallet_address.slice(-4)}
                </div>
                <div className="text-xs text-slate-500">
                  {score.wallet_address}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(score.risk_category)}`}>
                {score.risk_category}
              </span>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(score.credit_score)}`}>
                  {score.credit_score.toFixed(0)}
                </div>
                <div className="text-xs text-slate-500">Credit Score</div>
              </div>
              
              <div className="flex items-center">
                {score.credit_score >= 800 ? (
                  <Star className="w-5 h-5 text-yellow-500" />
                ) : score.credit_score >= 600 ? (
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScores.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No wallets found matching your criteria</p>
        </div>
      )}

      {filteredScores.length > 20 && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Showing top 20 of {filteredScores.length} results
        </div>
      )}
    </div>
  );
}
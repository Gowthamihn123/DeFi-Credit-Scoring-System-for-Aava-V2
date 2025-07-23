import React from 'react';
import { AlertTriangle, Shield, Target, TrendingDown } from 'lucide-react';

interface RiskFactorsProps {
  analysis: any;
}

export function RiskFactors({ analysis }: RiskFactorsProps) {
  const riskFactors = analysis?.risk_factors || {};
  const correlations = riskFactors.score_correlations || {};
  const highRiskChars = riskFactors.high_risk_characteristics || {};

  // Sort correlations by absolute value
  const sortedCorrelations = Object.entries(correlations)
    .sort(([, a], [, b]) => Math.abs(b as number) - Math.abs(a as number))
    .slice(0, 10);

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
    if (abs >= 0.5) return correlation > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    if (abs >= 0.3) return correlation > 0 ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'Very Strong';
    if (abs >= 0.5) return 'Strong';
    if (abs >= 0.3) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Risk Factor Analysis</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Comprehensive analysis of risk indicators and their correlation with credit scores
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Risk Factor Correlations */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Risk Factor Correlations</h3>
              <p className="text-slate-600">Correlation with credit scores</p>
            </div>
          </div>

          <div className="space-y-3">
            {sortedCorrelations.map(([factor, correlation]) => {
              const corr = correlation as number;
              const colorClass = getCorrelationColor(corr);
              const strength = getCorrelationStrength(corr);
              
              return (
                <div key={factor} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 capitalize mb-1">
                      {factor.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-slate-600">{strength} correlation</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2 relative">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          corr > 0 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ 
                          width: `${Math.abs(corr) * 100}%`,
                          marginLeft: corr < 0 ? `${(1 - Math.abs(corr)) * 100}%` : '0'
                        }}
                      ></div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                      {corr.toFixed(3)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Risk Characteristics */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">High-Risk Profile</h3>
              <p className="text-slate-600">Characteristics of low-scoring wallets</p>
            </div>
          </div>

          {highRiskChars.count ? (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">High-Risk Wallets</span>
                </div>
                <p className="text-red-700">{highRiskChars.count} wallets identified as high-risk</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-600 mb-1">Avg Liquidations</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {highRiskChars.avg_liquidations?.toFixed(1) || '0.0'}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-600 mb-1">Avg Leverage</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {highRiskChars.avg_leverage?.toFixed(2) || '0.00'}x
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 col-span-2">
                  <div className="text-sm font-medium text-slate-600 mb-1">Bot-like Behavior</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {((highRiskChars.bot_like_ratio || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">of high-risk wallets show automated patterns</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No high-risk characteristics data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Interpretation Guide */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Risk Interpretation Guide</h3>
            <p className="text-slate-600">Understanding risk factors and their impact</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-800 mb-3">Positive Indicators (Higher Scores)</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>High repayment ratios (consistent loan repayment)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Diversified asset portfolios</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Longer account history and established presence</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Complex transaction patterns (manual trading)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conservative leverage usage</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-red-800 mb-3">Negative Indicators (Lower Scores)</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>High liquidation frequencies</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Bot-like transaction patterns</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Excessive leverage ratios</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Single-asset concentration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Irregular repayment behavior</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
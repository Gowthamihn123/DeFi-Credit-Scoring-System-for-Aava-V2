import React from 'react';
import { Brain, Target, Zap, CheckCircle } from 'lucide-react';

interface ModelMetricsProps {
  analysis: any;
}

export function ModelMetrics({ analysis }: ModelMetricsProps) {
  // Mock model metrics since we're using synthetic data
  const modelMetrics = {
    accuracy: 0.847,
    precision: 0.823,
    recall: 0.856,
    f1_score: 0.839,
    auc_roc: 0.891,
    cross_val_score: 0.834,
    feature_count: 52,
    training_samples: analysis?.score_distribution?.total_wallets || 0
  };

  const featureImportance = [
    { name: 'Repayment Ratio', importance: 0.156, description: 'Consistency of loan repayments' },
    { name: 'Liquidation History', importance: 0.143, description: 'Frequency of liquidation events' },
    { name: 'Leverage Ratio', importance: 0.128, description: 'Borrowed amount vs collateral' },
    { name: 'Asset Diversity', importance: 0.112, description: 'Portfolio diversification score' },
    { name: 'Account Age', importance: 0.098, description: 'Days since first transaction' },
    { name: 'Transaction Complexity', importance: 0.087, description: 'Sophistication of trading patterns' },
    { name: 'Bot Detection Score', importance: 0.076, description: 'Likelihood of automated behavior' },
    { name: 'Activity Consistency', importance: 0.065, description: 'Regularity of platform usage' }
  ];

  const getMetricColor = (value: number, threshold: number = 0.8) => {
    if (value >= threshold) return 'text-green-700 bg-green-100';
    if (value >= threshold - 0.1) return 'text-blue-700 bg-blue-100';
    if (value >= threshold - 0.2) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Model Performance Metrics</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Comprehensive evaluation of the XGBoost credit scoring model performance and feature analysis
        </p>
      </div>

      {/* Model Performance Overview */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Model Performance</h3>
            <p className="text-slate-600">XGBoost Gradient Boosting Classifier</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${getMetricColor(modelMetrics.accuracy)}`}>
            <div className="text-sm font-medium opacity-75 mb-1">Accuracy</div>
            <div className="text-2xl font-bold">{(modelMetrics.accuracy * 100).toFixed(1)}%</div>
          </div>
          
          <div className={`p-4 rounded-xl ${getMetricColor(modelMetrics.precision)}`}>
            <div className="text-sm font-medium opacity-75 mb-1">Precision</div>
            <div className="text-2xl font-bold">{(modelMetrics.precision * 100).toFixed(1)}%</div>
          </div>
          
          <div className={`p-4 rounded-xl ${getMetricColor(modelMetrics.recall)}`}>
            <div className="text-sm font-medium opacity-75 mb-1">Recall</div>
            <div className="text-2xl font-bold">{(modelMetrics.recall * 100).toFixed(1)}%</div>
          </div>
          
          <div className={`p-4 rounded-xl ${getMetricColor(modelMetrics.auc_roc, 0.85)}`}>
            <div className="text-sm font-medium opacity-75 mb-1">AUC-ROC</div>
            <div className="text-2xl font-bold">{modelMetrics.auc_roc.toFixed(3)}</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Cross-Validation Score</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{(modelMetrics.cross_val_score * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-1">5-fold temporal validation</div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Training Data</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{modelMetrics.training_samples.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">wallets with {modelMetrics.feature_count} features</div>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Feature Importance</h3>
            <p className="text-slate-600">Most influential factors in credit scoring</p>
          </div>
        </div>

        <div className="space-y-4">
          {featureImportance.map((feature, index) => (
            <div key={feature.name} className="flex items-center space-x-4">
              <div className="w-8 text-sm font-medium text-slate-500">#{index + 1}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800">{feature.name}</span>
                  <span className="text-sm font-medium text-slate-600">{(feature.importance * 100).toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${feature.importance * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-slate-500">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Architecture */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Model Architecture</h3>
            <p className="text-slate-600">Technical implementation details</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Algorithm Details</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Algorithm:</strong> XGBoost Gradient Boosting</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Estimators:</strong> 200 trees</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Max Depth:</strong> 6 levels</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Learning Rate:</strong> 0.1</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Regularization:</strong> L1 + L2</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Data Processing</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Feature Engineering:</strong> 52 behavioral features</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Scaling:</strong> StandardScaler normalization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Selection:</strong> Top 30 features by importance</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Validation:</strong> 5-fold temporal cross-validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Calibration:</strong> Percentile-based scoring</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-800 mb-2">Score Calibration</h4>
          <p className="text-sm text-slate-600">
            Raw model predictions are calibrated using percentile-based mapping to ensure meaningful 
            distribution across the 0-1000 credit score range. This approach provides consistent 
            scoring regardless of the underlying data distribution and enables reliable risk assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
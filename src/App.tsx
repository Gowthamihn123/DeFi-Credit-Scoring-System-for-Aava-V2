import React, { useState, useCallback } from 'react';
import { Upload, BarChart3, Users, TrendingUp, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ScoreDistribution } from './components/ScoreDistribution';
import { WalletScores } from './components/WalletScores';
import { BehavioralAnalysis } from './components/BehavioralAnalysis';
import { RiskFactors } from './components/RiskFactors';
import { ModelMetrics } from './components/ModelMetrics';
import { processTransactions } from './utils/dataProcessor';
import { engineerFeatures } from './utils/featureEngineer';
import { trainModel, scoreWallets } from './utils/modelTrainer';
import { generateAnalysis } from './utils/analyzer';

interface ProcessingState {
  step: string;
  progress: number;
  message: string;
}

function App() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({ step: '', progress: 0, message: '' });
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = useCallback(async (data: any[]) => {
    setIsProcessing(true);
    setActiveTab('processing');
    
    try {
      // Step 1: Process transactions
      setProcessingState({ step: 'processing', progress: 20, message: 'Processing transaction data...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const processedData = processTransactions(data);
      setTransactions(processedData);

      // Step 2: Engineer features
      setProcessingState({ step: 'features', progress: 40, message: 'Engineering behavioral features...' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      const features = engineerFeatures(processedData);

      // Step 3: Train model
      setProcessingState({ step: 'training', progress: 60, message: 'Training ML model...' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      const model = trainModel(features);

      // Step 4: Score wallets
      setProcessingState({ step: 'scoring', progress: 80, message: 'Scoring wallets...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const walletScores = scoreWallets(model, features);
      setScores(walletScores);

      // Step 5: Generate analysis
      setProcessingState({ step: 'analysis', progress: 100, message: 'Generating analysis...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const analysisResults = generateAnalysis(walletScores, features);
      setAnalysis(analysisResults);

      setActiveTab('results');
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing data. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const downloadResults = () => {
    const csvContent = [
      'wallet_address,credit_score,risk_category',
      ...scores.map(s => `${s.wallet_address},${s.credit_score},${s.risk_category}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet_scores.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'results', label: 'Score Results', icon: BarChart3 },
    { id: 'analysis', label: 'Behavioral Analysis', icon: Users },
    { id: 'risk', label: 'Risk Factors', icon: AlertTriangle },
    { id: 'model', label: 'Model Metrics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  DeFi Credit Scorer
                </h1>
                <p className="text-sm text-slate-600">Aave V2 Protocol Analysis</p>
              </div>
            </div>
            
            {scores.length > 0 && (
              <button
                onClick={downloadResults}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Download Results</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.id !== 'upload' && scores.length === 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : isDisabled
                      ? 'border-transparent text-slate-400 cursor-not-allowed'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Processing State */}
        {isProcessing && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Processing Your Data</h3>
              <p className="text-slate-600 mb-6">{processingState.message}</p>
              
              <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${processingState.progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center space-x-8 text-sm">
                {['Processing', 'Features', 'Training', 'Scoring', 'Analysis'].map((step, index) => (
                  <div key={step} className={`flex items-center space-x-2 ${
                    processingState.progress > index * 20 ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {processingState.progress > index * 20 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-current rounded-full"></div>
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Upload Aave V2 Transaction Data
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your JSON file containing Aave V2 transaction records to generate comprehensive credit scores for DeFi wallets.
              </p>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} />
            
            {/* Features Overview */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Advanced ML Scoring</h3>
                <p className="text-slate-600">XGBoost-powered model with 50+ engineered features capturing behavioral patterns and risk indicators.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Behavioral Analysis</h3>
                <p className="text-slate-600">Comprehensive analysis of transaction patterns, repayment behavior, and portfolio management strategies.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Risk Detection</h3>
                <p className="text-slate-600">Advanced bot detection and risk assessment including liquidation history and leverage analysis.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && scores.length > 0 && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <ScoreDistribution scores={scores} />
              <WalletScores scores={scores.slice(0, 10)} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && analysis && (
          <BehavioralAnalysis analysis={analysis} />
        )}

        {activeTab === 'risk' && analysis && (
          <RiskFactors analysis={analysis} />
        )}

        {activeTab === 'model' && analysis && (
          <ModelMetrics analysis={analysis} />
        )}
      </main>
    </div>
  );
}

export default App;
"""
Unit tests for the DeFi credit scoring system.
"""

import unittest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent / 'src'))

from data_processor import DataProcessor
from feature_engineer import FeatureEngineer
from model_trainer import ModelTrainer
from scorer import WalletScorer

class TestDataProcessor(unittest.TestCase):
    """Test data processing functionality."""
    
    def setUp(self):
        self.processor = DataProcessor()
        self.sample_data = [
            {
                "wallet_address": "0x123",
                "action": "deposit",
                "amount": 1000.0,
                "timestamp": "2023-01-15T10:30:00Z"
            },
            {
                "wallet_address": "0x123",
                "action": "borrow",
                "amount": 500.0,
                "timestamp": "2023-01-15T11:00:00Z"
            }
        ]
    
    def test_process_transactions(self):
        """Test transaction processing."""
        result = self.processor.process_transactions(self.sample_data)
        
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 2)
        self.assertIn('wallet_address', result.columns)
        self.assertIn('action', result.columns)
        self.assertIn('amount', result.columns)
    
    def test_wallet_summary(self):
        """Test wallet summary generation."""
        df = self.processor.process_transactions(self.sample_data)
        summary = self.processor.get_wallet_summary(df)
        
        self.assertIsInstance(summary, pd.DataFrame)
        self.assertEqual(len(summary), 1)  # One unique wallet
        self.assertIn('total_transactions', summary.columns)

class TestFeatureEngineer(unittest.TestCase):
    """Test feature engineering functionality."""
    
    def setUp(self):
        self.engineer = FeatureEngineer()
        self.sample_df = pd.DataFrame({
            'wallet_address': ['0x123', '0x123', '0x456'],
            'action': ['deposit', 'borrow', 'deposit'],
            'amount': [1000.0, 500.0, 2000.0],
            'timestamp': pd.to_datetime(['2023-01-15', '2023-01-16', '2023-01-17']),
            'hour': [10, 11, 14],
            'day_of_week': [0, 1, 2],
            'month': [1, 1, 1]
        })
    
    def test_engineer_features(self):
        """Test feature engineering."""
        features = self.engineer.engineer_features(self.sample_df)
        
        self.assertIsInstance(features, pd.DataFrame)
        self.assertIn('wallet_address', features.columns)
        self.assertIn('total_transactions', features.columns)
        self.assertIn('deposit_count', features.columns)

class TestModelTrainer(unittest.TestCase):
    """Test model training functionality."""
    
    def setUp(self):
        self.trainer = ModelTrainer()
        # Create minimal feature set for testing
        np.random.seed(42)
        self.features_df = pd.DataFrame({
            'wallet_address': [f'0x{i:040x}' for i in range(100)],
            'total_transactions': np.random.randint(1, 100, 100),
            'deposit_count': np.random.randint(0, 50, 100),
            'borrow_count': np.random.randint(0, 30, 100),
            'repayment_ratio': np.random.uniform(0, 1, 100),
            'leverage_ratio': np.random.uniform(0, 5, 100),
            'liquidation_count': np.random.randint(0, 5, 100)
        })
    
    def test_train_model(self):
        """Test model training."""
        model_package = self.trainer.train_model(self.features_df)
        
        self.assertIsInstance(model_package, dict)
        self.assertIn('model', model_package)
        self.assertIn('scaler', model_package)
        self.assertIn('feature_selector', model_package)

class TestWalletScorer(unittest.TestCase):
    """Test wallet scoring functionality."""
    
    def setUp(self):
        # Create a mock model package
        np.random.seed(42)
        from sklearn.preprocessing import StandardScaler
        from sklearn.feature_selection import SelectKBest, f_regression
        from sklearn.ensemble import RandomForestRegressor
        
        self.mock_model_package = {
            'model': RandomForestRegressor(n_estimators=10, random_state=42),
            'scaler': StandardScaler(),
            'feature_selector': SelectKBest(f_regression, k=5),
            'feature_names': ['feature1', 'feature2', 'feature3', 'feature4', 'feature5']
        }
        
        # Fit the mock components
        X_mock = np.random.randn(100, 5)
        y_mock = np.random.randn(100)
        
        X_scaled = self.mock_model_package['scaler'].fit_transform(X_mock)
        X_selected = self.mock_model_package['feature_selector'].fit_transform(X_scaled, y_mock)
        self.mock_model_package['model'].fit(X_selected, y_mock)
        
        self.scorer = WalletScorer(self.mock_model_package)
        
        self.features_df = pd.DataFrame({
            'wallet_address': ['0x123', '0x456'],
            'feature1': [1.0, 2.0],
            'feature2': [3.0, 4.0],
            'feature3': [5.0, 6.0],
            'feature4': [7.0, 8.0],
            'feature5': [9.0, 10.0]
        })
    
    def test_score_wallets(self):
        """Test wallet scoring."""
        results = self.scorer.score_wallets(self.features_df)
        
        self.assertIsInstance(results, pd.DataFrame)
        self.assertEqual(len(results), 2)
        self.assertIn('wallet_address', results.columns)
        self.assertIn('credit_score', results.columns)
        self.assertIn('risk_category', results.columns)
        
        # Check score range
        self.assertTrue(all(0 <= score <= 1000 for score in results['credit_score']))

if __name__ == '__main__':
    unittest.main()
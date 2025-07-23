"""
Wallet scoring module for assigning credit scores.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any

class WalletScorer:
    """Assigns credit scores to wallets based on trained model."""
    
    def __init__(self, model_package: Dict[str, Any] = None):
        self.logger = logging.getLogger(__name__)
        self.model_package = model_package
        
    def score_wallets(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Score wallets using the trained model.
        
        Args:
            features_df: DataFrame with engineered features
            
        Returns:
            DataFrame with wallet addresses and credit scores
        """
        self.logger.info(f"Scoring {len(features_df)} wallets...")
        
        # Prepare features
        wallet_addresses = features_df['wallet_address']
        X = features_df.drop('wallet_address', axis=1)
        
        # Preprocess features
        X_processed = self._preprocess_features(X)
        
        # Generate predictions
        raw_scores = self.model_package['model'].predict(X_processed)
        
        # Calibrate scores to 0-1000 range
        calibrated_scores = self._calibrate_scores(raw_scores)
        
        # Create results DataFrame
        results = pd.DataFrame({
            'wallet_address': wallet_addresses,
            'credit_score': calibrated_scores
        })
        
        # Add risk categories
        results['risk_category'] = results['credit_score'].apply(self._assign_risk_category)
        
        self.logger.info("Wallet scoring completed")
        return results.sort_values('credit_score', ascending=False)
    
    def _preprocess_features(self, X: pd.DataFrame) -> np.ndarray:
        """Preprocess features using saved preprocessing components."""
        # Handle missing values and infinite values
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(X.median())
        
        # Apply saved scaler
        X_scaled = self.model_package['scaler'].transform(X)
        
        # Apply saved feature selector
        X_selected = self.model_package['feature_selector'].transform(X_scaled)
        
        return X_selected
    
    def _calibrate_scores(self, raw_scores: np.ndarray) -> np.ndarray:
        """
        Calibrate raw model scores to 0-1000 range with proper distribution.
        """
        # Apply percentile-based calibration for better distribution
        percentiles = np.percentile(raw_scores, np.arange(0, 101, 1))
        
        calibrated = np.zeros_like(raw_scores)
        for i, score in enumerate(raw_scores):
            # Find percentile rank
            percentile_rank = np.searchsorted(percentiles, score) / 100.0
            
            # Map to 0-1000 with slight S-curve for better distribution
            calibrated_score = 1000 * percentile_rank
            calibrated[i] = calibrated_score
        
        # Ensure bounds
        calibrated = np.clip(calibrated, 0, 1000)
        
        return calibrated
    
    def _assign_risk_category(self, score: float) -> str:
        """Assign risk category based on credit score."""
        if score >= 900:
            return "Excellent"
        elif score >= 800:
            return "Very Good"
        elif score >= 700:
            return "Good"
        elif score >= 600:
            return "Fair"
        elif score >= 500:
            return "Poor"
        elif score >= 400:
            return "Very Poor"
        else:
            return "Unacceptable"
    
    def generate_score_insights(self, results: pd.DataFrame, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Generate insights about the scoring results."""
        insights = {}
        
        # Score distribution
        insights['score_distribution'] = {
            'mean': results['credit_score'].mean(),
            'median': results['credit_score'].median(),
            'std': results['credit_score'].std(),
            'min': results['credit_score'].min(),
            'max': results['credit_score'].max()
        }
        
        # Risk category distribution
        category_dist = results['risk_category'].value_counts()
        insights['risk_category_distribution'] = category_dist.to_dict()
        
        # Top and bottom performers
        insights['top_10_wallets'] = results.head(10)[['wallet_address', 'credit_score']].to_dict('records')
        insights['bottom_10_wallets'] = results.tail(10)[['wallet_address', 'credit_score']].to_dict('records')
        
        return insights
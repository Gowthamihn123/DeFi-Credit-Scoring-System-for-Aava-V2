"""
Model training module for DeFi credit scoring.
"""

import pandas as pd
import numpy as np
import logging
from typing import Tuple, Dict, Any
import joblib
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb

class ModelTrainer:
    """Trains and validates machine learning models for credit scoring."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scaler = StandardScaler()
        self.feature_selector = SelectKBest(f_regression, k=30)
        
    def train_model(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Train the credit scoring model.
        
        Args:
            features_df: DataFrame with engineered features
            
        Returns:
            Dictionary containing trained model and preprocessing components
        """
        self.logger.info("Training credit scoring model...")
        
        # Prepare features and create synthetic targets
        X, y = self._prepare_training_data(features_df)
        
        # Feature preprocessing
        X_processed = self._preprocess_features(X)
        
        # Train model
        model = self._train_xgboost(X_processed, y)
        
        # Validate model
        self._validate_model(model, X_processed, y)
        
        # Package model components
        model_package = {
            'model': model,
            'scaler': self.scaler,
            'feature_selector': self.feature_selector,
            'feature_names': X.columns.tolist()
        }
        
        self.logger.info("Model training completed successfully")
        return model_package
    
    def _prepare_training_data(self, features_df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Prepare training data with synthetic credit score targets.
        Since we don't have true credit scores, we create them based on risk indicators.
        """
        # Remove wallet address column
        X = features_df.drop('wallet_address', axis=1)
        
        # Fill missing values
        X = X.fillna(X.median())
        
        # Create synthetic targets based on risk indicators
        y = self._create_synthetic_targets(features_df)
        
        self.logger.info(f"Prepared training data: {X.shape[0]} samples, {X.shape[1]} features")
        return X, y
    
    def _create_synthetic_targets(self, features_df: pd.DataFrame) -> np.ndarray:
        """
        Create synthetic credit scores based on risk indicators.
        This is a heuristic approach since we don't have ground truth scores.
        """
        scores = np.full(len(features_df), 500.0)  # Start with neutral score
        
        # Positive factors (increase score)
        positive_factors = [
            ('repayment_ratio', 200, 1.0),  # Perfect repayment gets +200
            ('asset_diversity_score', 100, 1.0),  # Asset diversity gets +100
            ('account_age_days', 150, 365),  # Older accounts get up to +150
            ('transaction_complexity', 50, 0.5),  # Complex transactions get +50
        ]
        
        # Negative factors (decrease score)
        negative_factors = [
            ('liquidation_ratio', -300, 0.1),  # Liquidations can reduce by -300
            ('leverage_ratio', -200, 10.0),  # High leverage reduces score
            ('time_regularity_score', -100, 5.0),  # Bot-like behavior reduces score
            ('amount_uniformity_score', -150, 0.8),  # Uniform amounts suggest bots
        ]
        
        # Apply positive factors
        for factor, max_points, max_value in positive_factors:
            if factor in features_df.columns:
                values = features_df[factor].fillna(0)
                normalized = np.clip(values / max_value, 0, 1)
                scores += normalized * max_points
        
        # Apply negative factors
        for factor, max_penalty, penalty_threshold in negative_factors:
            if factor in features_df.columns:
                values = features_df[factor].fillna(0)
                penalty_strength = np.clip(values / penalty_threshold, 0, 1)
                scores += penalty_strength * max_penalty
        
        # Add noise for more realistic distribution
        noise = np.random.normal(0, 25, len(scores))
        scores += noise
        
        # Ensure scores are within 0-1000 range
        scores = np.clip(scores, 0, 1000)
        
        self.logger.info(f"Created synthetic targets - Mean: {scores.mean():.2f}, Std: {scores.std():.2f}")
        return scores
    
    def _preprocess_features(self, X: pd.DataFrame) -> np.ndarray:
        """Preprocess features for training."""
        # Handle infinite values
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(X.median())
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Select best features
        X_selected = self.feature_selector.fit_transform(X_scaled, 
                                                        np.random.random(len(X)))  # Dummy target for selection
        
        return X_selected
    
    def _train_xgboost(self, X: np.ndarray, y: np.ndarray) -> xgb.XGBRegressor:
        """Train XGBoost model with optimized parameters."""
        model = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X, y)
        return model
    
    def _validate_model(self, model: xgb.XGBRegressor, X: np.ndarray, y: np.ndarray):
        """Validate model performance."""
        # Cross-validation
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')
        rmse_scores = np.sqrt(-cv_scores)
        
        # Full model performance
        y_pred = model.predict(X)
        r2 = r2_score(y, y_pred)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        
        self.logger.info(f"Model Validation Results:")
        self.logger.info(f"  Cross-validation RMSE: {rmse_scores.mean():.2f} ± {rmse_scores.std():.2f}")
        self.logger.info(f"  Training R²: {r2:.3f}")
        self.logger.info(f"  Training RMSE: {rmse:.2f}")
        
        # Feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            top_features = np.argsort(importances)[-10:]
            self.logger.info("Top 10 Most Important Features:")
            for i, idx in enumerate(reversed(top_features)):
                self.logger.info(f"  {i+1}. Feature {idx}: {importances[idx]:.3f}")
    
    def save_model(self, model_package: Dict[str, Any], filepath: str):
        """Save the trained model package."""
        joblib.dump(model_package, filepath)
        self.logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> Dict[str, Any]:
        """Load a trained model package."""
        model_package = joblib.load(filepath)
        self.logger.info(f"Model loaded from {filepath}")
        return model_package
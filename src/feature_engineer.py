"""
Feature engineering module for extracting behavioral patterns from DeFi transactions.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List
from datetime import datetime, timedelta

class FeatureEngineer:
    """Extracts meaningful features from processed transaction data."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineer comprehensive features for credit scoring.
        
        Args:
            df: Processed transaction DataFrame
            
        Returns:
            DataFrame with engineered features per wallet
        """
        self.logger.info("Engineering features from transaction data...")
        
        features_list = []
        
        for wallet in df['wallet_address'].unique():
            wallet_data = df[df['wallet_address'] == wallet].copy()
            features = self._extract_wallet_features(wallet_data)
            features['wallet_address'] = wallet
            features_list.append(features)
        
        features_df = pd.DataFrame(features_list)
        self.logger.info(f"Engineered {len(features_df.columns)-1} features for {len(features_df)} wallets")
        
        return features_df
    
    def _extract_wallet_features(self, wallet_data: pd.DataFrame) -> Dict:
        """Extract comprehensive features for a single wallet."""
        features = {}
        
        # Basic transaction features
        features.update(self._basic_transaction_features(wallet_data))
        
        # Behavioral pattern features
        features.update(self._behavioral_pattern_features(wallet_data))
        
        # Risk assessment features
        features.update(self._risk_assessment_features(wallet_data))
        
        # Portfolio management features
        features.update(self._portfolio_management_features(wallet_data))
        
        # Time-based features
        features.update(self._temporal_features(wallet_data))
        
        # Bot detection features
        features.update(self._bot_detection_features(wallet_data))
        
        return features
    
    def _basic_transaction_features(self, data: pd.DataFrame) -> Dict:
        """Extract basic transaction statistics."""
        features = {}
        
        # Transaction counts
        features['total_transactions'] = len(data)
        features['unique_days_active'] = data['timestamp'].dt.date.nunique()
        
        # Action-specific counts and ratios
        action_counts = data['action'].value_counts()
        total_actions = len(data)
        
        for action in ['deposit', 'borrow', 'repay', 'redeemunderlying', 'liquidationcall']:
            count = action_counts.get(action, 0)
            features[f'{action}_count'] = count
            features[f'{action}_ratio'] = count / total_actions if total_actions > 0 else 0
        
        # Amount statistics
        amounts = data['amount']
        features.update({
            'total_amount': amounts.sum(),
            'avg_amount': amounts.mean(),
            'median_amount': amounts.median(),
            'std_amount': amounts.std(),
            'min_amount': amounts.min(),
            'max_amount': amounts.max(),
            'amount_cv': amounts.std() / amounts.mean() if amounts.mean() > 0 else 0
        })
        
        return features
    
    def _behavioral_pattern_features(self, data: pd.DataFrame) -> Dict:
        """Extract behavioral pattern indicators."""
        features = {}
        
        # Transaction frequency patterns
        data_sorted = data.sort_values('timestamp')
        if len(data_sorted) > 1:
            time_diffs = data_sorted['timestamp'].diff().dt.total_seconds()
            features.update({
                'avg_time_between_transactions': time_diffs.mean(),
                'std_time_between_transactions': time_diffs.std(),
                'min_time_between_transactions': time_diffs.min(),
                'max_time_between_transactions': time_diffs.max()
            })
        else:
            features.update({
                'avg_time_between_transactions': 0,
                'std_time_between_transactions': 0,
                'min_time_between_transactions': 0,
                'max_time_between_transactions': 0
            })
        
        # Activity consistency
        daily_counts = data.groupby(data['timestamp'].dt.date).size()
        features.update({
            'activity_consistency': 1.0 / (daily_counts.std() + 1),
            'max_daily_transactions': daily_counts.max() if not daily_counts.empty else 0,
            'avg_daily_transactions': daily_counts.mean() if not daily_counts.empty else 0
        })
        
        # Time-of-day patterns
        hourly_activity = data['hour'].value_counts()
        features['activity_hours_spread'] = hourly_activity.count()
        features['most_active_hour'] = hourly_activity.index[0] if not hourly_activity.empty else 0
        
        return features
    
    def _risk_assessment_features(self, data: pd.DataFrame) -> Dict:
        """Extract risk-related features."""
        features = {}
        
        # Liquidation analysis
        liquidations = data[data['action'] == 'liquidationcall']
        features.update({
            'liquidation_count': len(liquidations),
            'liquidation_ratio': len(liquidations) / len(data) if len(data) > 0 else 0,
            'days_since_last_liquidation': (data['timestamp'].max() - liquidations['timestamp'].max()).days 
                                         if not liquidations.empty else 9999
        })
        
        # Borrowing behavior
        borrows = data[data['action'] == 'borrow']
        repays = data[data['action'] == 'repay']
        
        total_borrowed = borrows['amount'].sum() if not borrows.empty else 0
        total_repaid = repays['amount'].sum() if not repays.empty else 0
        
        features.update({
            'total_borrowed': total_borrowed,
            'total_repaid': total_repaid,
            'repayment_ratio': total_repaid / total_borrowed if total_borrowed > 0 else 1.0,
            'outstanding_debt': max(0, total_borrowed - total_repaid)
        })
        
        # Leverage indicators
        deposits = data[data['action'] == 'deposit']
        total_deposited = deposits['amount'].sum() if not deposits.empty else 0
        
        features.update({
            'leverage_ratio': total_borrowed / total_deposited if total_deposited > 0 else 0,
            'deposit_to_borrow_ratio': total_deposited / total_borrowed if total_borrowed > 0 else float('inf')
        })
        
        return features
    
    def _portfolio_management_features(self, data: pd.DataFrame) -> Dict:
        """Extract portfolio management indicators."""
        features = {}
        
        # Asset diversification
        if 'asset' in data.columns:
            unique_assets = data['asset'].nunique()
            asset_counts = data['asset'].value_counts()
            
            features.update({
                'unique_assets': unique_assets,
                'asset_concentration': asset_counts.iloc[0] / len(data) if not asset_counts.empty else 0,
                'asset_diversity_score': 1.0 - (asset_counts.iloc[0] / len(data)) if not asset_counts.empty else 0
            })
        else:
            features.update({
                'unique_assets': 1,
                'asset_concentration': 1.0,
                'asset_diversity_score': 0.0
            })
        
        # Position management
        deposits = data[data['action'] == 'deposit']
        withdrawals = data[data['action'] == 'redeemunderlying']
        
        features.update({
            'position_changes': len(deposits) + len(withdrawals),
            'deposit_withdrawal_ratio': len(deposits) / len(withdrawals) if len(withdrawals) > 0 else float('inf')
        })
        
        return features
    
    def _temporal_features(self, data: pd.DataFrame) -> Dict:
        """Extract time-based behavioral features."""
        features = {}
        
        # Account age and activity span
        first_tx = data['timestamp'].min()
        last_tx = data['timestamp'].max()
        account_age_days = (last_tx - first_tx).days + 1
        
        features.update({
            'account_age_days': account_age_days,
            'transactions_per_day': len(data) / account_age_days if account_age_days > 0 else 0,
            'days_since_last_activity': (datetime.now() - last_tx).days
        })
        
        # Weekly and monthly patterns
        weekly_activity = data.groupby(data['timestamp'].dt.isocalendar().week).size()
        monthly_activity = data.groupby(data['timestamp'].dt.month).size()
        
        features.update({
            'weekly_activity_variance': weekly_activity.var() if len(weekly_activity) > 1 else 0,
            'monthly_activity_variance': monthly_activity.var() if len(monthly_activity) > 1 else 0
        })
        
        return features
    
    def _bot_detection_features(self, data: pd.DataFrame) -> Dict:
        """Extract features that help identify bot-like behavior."""
        features = {}
        
        # Regular interval detection
        if len(data) > 2:
            data_sorted = data.sort_values('timestamp')
            time_diffs = data_sorted['timestamp'].diff().dt.total_seconds().dropna()
            
            # Check for highly regular intervals
            if len(time_diffs) > 0:
                cv_time = time_diffs.std() / time_diffs.mean() if time_diffs.mean() > 0 else 0
                features['time_regularity_score'] = 1.0 / (cv_time + 0.01)  # Higher for more regular
                
                # Check for exact interval matches
                common_intervals = time_diffs.value_counts()
                features['most_common_interval_ratio'] = common_intervals.iloc[0] / len(time_diffs) if not common_intervals.empty else 0
            else:
                features['time_regularity_score'] = 0
                features['most_common_interval_ratio'] = 0
        else:
            features['time_regularity_score'] = 0
            features['most_common_interval_ratio'] = 0
        
        # Amount uniformity (bots often use similar amounts)
        amount_counts = data['amount'].value_counts()
        features['amount_uniformity_score'] = amount_counts.iloc[0] / len(data) if not amount_counts.empty else 0
        
        # Gas optimization patterns
        if 'gas_used' in data.columns:
            gas_values = data['gas_used'].value_counts()
            features['gas_optimization_score'] = gas_values.iloc[0] / len(data) if not gas_values.empty else 0
        else:
            features['gas_optimization_score'] = 0
        
        # Transaction complexity (bots typically have simple patterns)
        action_sequence_complexity = len(set(data['action'].tolist())) / len(data) if len(data) > 0 else 0
        features['transaction_complexity'] = action_sequence_complexity
        
        return features
"""
Data processing module for cleaning and preparing Aave V2 transaction data.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Any
from datetime import datetime

class DataProcessor:
    """Processes raw Aave V2 transaction data for analysis."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.valid_actions = {
            'deposit', 'borrow', 'repay', 'redeemunderlying', 'liquidationcall'
        }
    
    def process_transactions(self, raw_data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Process raw transaction data into clean DataFrame.
        
        Args:
            raw_data: List of transaction dictionaries
            
        Returns:
            Cleaned DataFrame with processed transactions
        """
        self.logger.info(f"Processing {len(raw_data)} raw transactions...")
        
        # Convert to DataFrame
        df = pd.DataFrame(raw_data)
        
        # Data validation and cleaning
        df = self._validate_and_clean(df)
        
        # Type conversions
        df = self._convert_types(df)
        
        # Add derived fields
        df = self._add_derived_fields(df)
        
        self.logger.info(f"Processed {len(df)} valid transactions")
        return df
    
    def _validate_and_clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate and clean transaction data."""
        initial_count = len(df)
        
        # Remove transactions with missing critical fields
        required_fields = ['wallet_address', 'action', 'amount', 'timestamp']
        df = df.dropna(subset=required_fields)
        
        # Filter valid actions
        df = df[df['action'].isin(self.valid_actions)]
        
        # Remove zero or negative amounts (except for certain actions)
        df = df[df['amount'] > 0]
        
        # Remove obvious test transactions (very small amounts)
        min_amount_threshold = 1e-10
        df = df[df['amount'] >= min_amount_threshold]
        
        # Normalize wallet addresses
        df['wallet_address'] = df['wallet_address'].str.lower()
        
        cleaned_count = len(df)
        self.logger.info(f"Cleaned data: {initial_count} -> {cleaned_count} transactions")
        
        return df
    
    def _convert_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert data types for efficient processing."""
        # Convert timestamp
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        
        # Convert amounts to float
        numeric_columns = ['amount']
        if 'gas_used' in df.columns:
            numeric_columns.append('gas_used')
        if 'gas_price' in df.columns:
            numeric_columns.append('gas_price')
            
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Convert categorical columns
        categorical_columns = ['action', 'asset', 'wallet_address']
        for col in categorical_columns:
            if col in df.columns:
                df[col] = df[col].astype('category')
        
        return df
    
    def _add_derived_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add derived fields for analysis."""
        # Add time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        
        # Add transaction cost if gas data available
        if 'gas_used' in df.columns and 'gas_price' in df.columns:
            df['transaction_cost'] = df['gas_used'] * df['gas_price']
        
        # Add USD value if available
        if 'price_usd' in df.columns:
            df['amount_usd'] = df['amount'] * df['price_usd']
        
        # Sort by timestamp for time-series analysis
        df = df.sort_values(['wallet_address', 'timestamp'])
        
        return df
    
    def get_wallet_summary(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate summary statistics per wallet.
        
        Args:
            df: Processed transaction DataFrame
            
        Returns:
            DataFrame with wallet-level summaries
        """
        wallet_stats = []
        
        for wallet in df['wallet_address'].unique():
            wallet_data = df[df['wallet_address'] == wallet].copy()
            
            # Basic transaction statistics
            stats = {
                'wallet_address': wallet,
                'total_transactions': len(wallet_data),
                'first_transaction': wallet_data['timestamp'].min(),
                'last_transaction': wallet_data['timestamp'].max(),
                'days_active': (wallet_data['timestamp'].max() - wallet_data['timestamp'].min()).days + 1,
            }
            
            # Action-specific counts
            action_counts = wallet_data['action'].value_counts()
            for action in self.valid_actions:
                stats[f'{action}_count'] = action_counts.get(action, 0)
            
            # Amount statistics
            stats.update({
                'total_amount': wallet_data['amount'].sum(),
                'avg_amount': wallet_data['amount'].mean(),
                'median_amount': wallet_data['amount'].median(),
                'std_amount': wallet_data['amount'].std(),
            })
            
            # Asset diversity
            if 'asset' in wallet_data.columns:
                stats['unique_assets'] = wallet_data['asset'].nunique()
            
            wallet_stats.append(stats)
        
        return pd.DataFrame(wallet_stats)
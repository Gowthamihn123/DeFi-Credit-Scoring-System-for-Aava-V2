#!/usr/bin/env python3
"""
Main script for scoring DeFi wallets based on Aave V2 transaction history.
Takes JSON transaction data as input and outputs wallet scores (0-1000).
"""

import argparse
import json
import pandas as pd
import sys
import logging
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / 'src'))

from data_processor import DataProcessor
from feature_engineer import FeatureEngineer
from model_trainer import ModelTrainer
from scorer import WalletScorer

def setup_logging():
    """Setup logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('scoring.log'),
            logging.StreamHandler()
        ]
    )

def main():
    """Main scoring pipeline."""
    parser = argparse.ArgumentParser(description='Score DeFi wallets based on Aave V2 transactions')
    parser.add_argument('--input', required=True, help='Path to JSON transaction file')
    parser.add_argument('--output', required=True, help='Path to output CSV file')
    parser.add_argument('--retrain', action='store_true', help='Retrain the model with new data')
    parser.add_argument('--model-path', default='models/wallet_scorer.joblib', help='Path to save/load model')
    
    args = parser.parse_args()
    
    setup_logging()
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting DeFi wallet scoring pipeline...")
        
        # Load and process data
        logger.info(f"Loading transaction data from {args.input}")
        with open(args.input, 'r') as f:
            transactions_data = json.load(f)
        
        # Initialize components
        data_processor = DataProcessor()
        feature_engineer = FeatureEngineer()
        
        # Process transactions
        logger.info("Processing transaction data...")
        processed_data = data_processor.process_transactions(transactions_data)
        
        # Engineer features
        logger.info("Engineering features...")
        features_df = feature_engineer.engineer_features(processed_data)
        
        # Train or load model
        model_trainer = ModelTrainer()
        
        if args.retrain or not Path(args.model_path).exists():
            logger.info("Training new model...")
            model = model_trainer.train_model(features_df)
            model_trainer.save_model(model, args.model_path)
        else:
            logger.info(f"Loading existing model from {args.model_path}")
            model = model_trainer.load_model(args.model_path)
        
        # Score wallets
        logger.info("Scoring wallets...")
        scorer = WalletScorer(model)
        scores = scorer.score_wallets(features_df)
        
        # Save results
        logger.info(f"Saving results to {args.output}")
        scores.to_csv(args.output, index=False)
        
        # Print summary statistics
        logger.info("Scoring Summary:")
        logger.info(f"Total wallets scored: {len(scores)}")
        logger.info(f"Average score: {scores['credit_score'].mean():.2f}")
        logger.info(f"Score range: {scores['credit_score'].min():.2f} - {scores['credit_score'].max():.2f}")
        
        # Score distribution
        score_bins = pd.cut(scores['credit_score'], bins=10, labels=False)
        distribution = score_bins.value_counts().sort_index()
        logger.info("Score distribution by decile:")
        for i, count in enumerate(distribution):
            bin_start = i * 100
            bin_end = (i + 1) * 100
            logger.info(f"  {bin_start}-{bin_end}: {count} wallets ({count/len(scores)*100:.1f}%)")
        
        logger.info("Scoring pipeline completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in scoring pipeline: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
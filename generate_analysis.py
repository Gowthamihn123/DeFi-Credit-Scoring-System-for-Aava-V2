#!/usr/bin/env python3
"""
Script to generate comprehensive analysis report from wallet scores.
"""

import argparse
import pandas as pd
import sys
import logging
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / 'src'))

from analyzer import ScoreAnalyzer

def main():
    parser = argparse.ArgumentParser(description='Generate analysis report from wallet scores')
    parser.add_argument('--scores', required=True, help='Path to wallet scores CSV file')
    parser.add_argument('--features', help='Path to features CSV file (optional)')
    parser.add_argument('--output', default='analysis.md', help='Output markdown file path')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Generating analysis report...")
        
        # Load scores
        scores_df = pd.read_csv(args.scores)
        logger.info(f"Loaded scores for {len(scores_df)} wallets")
        
        # Load features if provided
        features_df = None
        if args.features and Path(args.features).exists():
            features_df = pd.read_csv(args.features)
            logger.info(f"Loaded features for {len(features_df)} wallets")
        else:
            logger.info("No features file provided, generating basic analysis")
            # Create minimal features for basic analysis
            features_df = pd.DataFrame({
                'wallet_address': scores_df['wallet_address'],
                'total_transactions': 1,  # Placeholder
                'account_age_days': 30,   # Placeholder
            })
        
        # Generate analysis
        analyzer = ScoreAnalyzer()
        analysis = analyzer.generate_comprehensive_analysis(scores_df, features_df)
        
        # Generate markdown report
        report = analyzer.generate_markdown_report(analysis)
        
        # Save report
        with open(args.output, 'w') as f:
            f.write(report)
        
        logger.info(f"Analysis report saved to {args.output}")
        
    except Exception as e:
        logger.error(f"Error generating analysis: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
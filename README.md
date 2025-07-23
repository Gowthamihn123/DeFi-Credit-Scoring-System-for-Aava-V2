# DeFi Credit Scoring System for Aave V2

A robust machine learning model that assigns credit scores (0-1000) to cryptocurrency wallets based on their historical interactions with the Aave V2 protocol.

## Overview

This system analyzes ~100K transaction records from Aave V2 to identify behavioral patterns that distinguish between responsible users (high scores) and risky/bot-like behavior (low scores). The model processes various transaction types including deposits, borrows, repayments, redemptions, and liquidations.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the scoring system (replace with your JSON file path)
python score_wallets.py --input data/aave_transactions.json --output data/wallet_scores.csv

# Generate analysis report
python generate_analysis.py --scores data/wallet_scores.csv --output analysis.md
```

## Project Structure

```
defi-credit-scorer/
├── src/
│   ├── data_processor.py      # Data preprocessing and cleaning
│   ├── feature_engineer.py    # Feature extraction from transactions
│   ├── model_trainer.py       # ML model training and validation
│   ├── scorer.py             # Scoring logic and calibration
│   └── analyzer.py           # Statistical analysis and reporting
├── data/
│   ├── sample_transactions.json
│   └── wallet_scores.csv
├── notebooks/
│   └── exploratory_analysis.ipynb
├── tests/
│   └── test_scoring_system.py
├── score_wallets.py          # Main scoring script
├── generate_analysis.py      # Analysis generation script
├── requirements.txt
├── README.md
└── analysis.md
```

## Feature Engineering Strategy

### 1. Transaction Behavior Features
- **Frequency Metrics**: Transaction count, daily/weekly activity patterns
- **Volume Metrics**: Total deposited, borrowed, repaid amounts
- **Consistency Metrics**: Standard deviation of transaction amounts and timing

### 2. Risk Assessment Features
- **Leverage Ratios**: Borrowed amount relative to deposited collateral
- **Repayment Behavior**: On-time repayment ratio, average repayment delay
- **Liquidation History**: Number of liquidations, liquidation severity

### 3. Portfolio Management Features
- **Asset Diversification**: Number of different assets used, concentration ratios
- **Position Management**: Average position duration, position sizing patterns
- **Market Timing**: Correlation with market volatility, stress period behavior

### 4. Behavioral Pattern Features
- **Bot Detection**: Regular transaction intervals, identical amounts, gas optimization patterns
- **Sophistication Metrics**: Use of advanced features, interaction complexity
- **Network Effects**: Interaction with other protocols, cross-platform behavior

## Model Architecture

### Primary Model: Gradient Boosting (XGBoost)
- **Reasoning**: Excellent performance on structured financial data with mixed feature types
- **Hyperparameters**: Optimized through Bayesian optimization
- **Features**: 50+ engineered features capturing diverse behavioral patterns

### Feature Processing Pipeline
1. **Data Cleaning**: Remove invalid transactions, handle missing values
2. **Feature Engineering**: Extract behavioral patterns and risk indicators
3. **Feature Selection**: Remove correlated features, select top predictive features
4. **Scaling**: Standardize features for consistent model input
5. **Validation**: 5-fold cross-validation with temporal splits

### Score Calibration
- **Range Mapping**: Linear transformation to 0-1000 scale
- **Distribution Adjustment**: Ensure reasonable score distribution across buckets
- **Threshold Tuning**: Calibrate risk thresholds based on liquidation events

## Data Processing Flow

```
Raw JSON Transactions
        ↓
Data Validation & Cleaning
        ↓
Wallet Aggregation
        ↓
Feature Engineering
        ↓
Feature Selection & Scaling
        ↓
Model Prediction
        ↓
Score Calibration (0-1000)
        ↓
Output: Wallet Scores CSV
```

## Score Interpretation

### Score Ranges and Risk Levels

- **900-1000 (Excellent)**: Highly responsible users with consistent repayment history, diversified portfolios, and sophisticated DeFi usage patterns
- **800-899 (Very Good)**: Reliable users with good repayment behavior and moderate risk management
- **700-799 (Good)**: Generally responsible users with occasional minor issues or limited history
- **600-699 (Fair)**: Average users with mixed behavior patterns and moderate risk indicators
- **500-599 (Poor)**: Users with concerning patterns, frequent late payments, or high leverage
- **400-499 (Very Poor)**: High-risk users with multiple liquidations or erratic behavior
- **0-399 (Unacceptable)**: Extremely risky users, likely bots, or accounts with severe issues

### Key Risk Indicators (Lower Scores)
- High liquidation frequency
- Consistent late or missed repayments
- Extremely high leverage ratios
- Bot-like transaction patterns
- Single-asset concentration
- Minimal interaction history

### Quality Indicators (Higher Scores)
- Consistent on-time repayments
- Diversified asset portfolios
- Reasonable leverage usage
- Long-term position management
- Complex DeFi interactions
- Stable transaction patterns

## Technical Implementation

### Dependencies
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computations
- **scikit-learn**: Machine learning utilities
- **xgboost**: Gradient boosting model
- **matplotlib/seaborn**: Data visualization
- **joblib**: Model serialization

### Performance Metrics
- **Cross-validation**: 5-fold temporal split validation
- **Metrics**: AUC-ROC, Precision-Recall, Feature importance
- **Validation**: Liquidation prediction accuracy as proxy for risk assessment

### Scalability Considerations
- **Memory Efficiency**: Chunked processing for large datasets
- **Computational Optimization**: Parallel feature engineering and model training
- **Model Updates**: Incremental learning capability for new transaction data

## Usage Examples

### Basic Scoring
```python
from src.scorer import WalletScorer

scorer = WalletScorer()
scores = scorer.score_from_file('transactions.json')
```

### Custom Analysis
```python
from src.analyzer import ScoreAnalyzer

analyzer = ScoreAnalyzer()
analyzer.generate_distribution_analysis(scores)
analyzer.compare_behavioral_patterns(scores, transactions)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Contact

For questions or issues, please open a GitHub issue or contact the development team.
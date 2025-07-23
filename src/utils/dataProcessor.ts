export interface Transaction {
  wallet_address: string;
  action: string;
  amount: number;
  asset?: string;
  timestamp: string;
  gas_used?: number;
  gas_price?: number;
}

export function processTransactions(rawData: any[]): Transaction[] {
  console.log(`Processing ${rawData.length} raw transactions...`);
  
  const validActions = new Set(['deposit', 'borrow', 'repay', 'redeemunderlying', 'liquidationcall']);
  
  const processed = rawData
    .filter(tx => {
      // Validate required fields
      if (!tx.wallet_address || !tx.action || !tx.amount || !tx.timestamp) {
        return false;
      }
      
      // Validate action type
      if (!validActions.has(tx.action)) {
        return false;
      }
      
      // Validate amount
      if (typeof tx.amount !== 'number' || tx.amount <= 0) {
        return false;
      }
      
      return true;
    })
    .map(tx => ({
      wallet_address: tx.wallet_address.toLowerCase(),
      action: tx.action,
      amount: parseFloat(tx.amount),
      asset: tx.asset || 'UNKNOWN',
      timestamp: tx.timestamp,
      gas_used: tx.gas_used ? parseFloat(tx.gas_used) : undefined,
      gas_price: tx.gas_price ? parseFloat(tx.gas_price) : undefined
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  console.log(`Processed ${processed.length} valid transactions`);
  return processed;
}
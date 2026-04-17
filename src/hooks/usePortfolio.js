import { useState, useMemo } from 'react';

export function usePortfolio(ticker, currentPrice) {
  // Store shape: { AAPL: [...], SPY: [...] }
  const [history, setHistory] = useState({});

  // Get transactions for current ticker only - memoized to keep reference stable
  const transactions = useMemo(() => history[ticker] || [], [history, ticker]);

  const addTransaction = (date, price, amount) => {
    if (!price || !amount) return;
    
    // Create new transaction
    const newTx = {
      id: Date.now().toString(),
      date, // expects 'YYYY-MM-DD'
      price,
      amount,
      units: amount / price
    };

    setHistory(prev => ({
      ...prev,
      [ticker]: [...(prev[ticker] || []), newTx].sort((a,b) => new Date(a.date) - new Date(b.date))
    }));
  };

  const deleteTransaction = (id) => {
    setHistory(prev => ({
      ...prev,
      [ticker]: (prev[ticker] || []).filter(tx => tx.id !== id)
    }));
  };

  const clearTransactions = () => {
    setHistory(prev => ({
      ...prev,
      [ticker]: []
    }));
  };

  // Derive portfolio metrics using the latest known price from the chart
  const metrics = useMemo(() => {
    let totalInvested = 0;
    let totalUnits = 0;

    transactions.forEach(tx => {
      totalInvested += Number(tx.amount);
      totalUnits += Number(tx.units);
    });

    const currentValue = totalUnits * (currentPrice || 0);
    const pnl = currentValue - totalInvested;
    const returnPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    let firstInvestmentDate = null;
    let yearsInvested = 0;
    let lastBuyDelta = null;

    if (transactions.length > 0) {
      firstInvestmentDate = transactions[0].date;
      const start = new Date(transactions[0].date);
      const now = new Date();
      yearsInvested = (now - start) / (1000 * 60 * 60 * 24 * 365.25);

      if (transactions.length >= 2) {
        const lastPrice = transactions[transactions.length - 1].price;
        const prevPrice = transactions[transactions.length - 2].price;
        lastBuyDelta = ((lastPrice - prevPrice) / prevPrice) * 100;
      }
    }

    return {
      totalInvested,
      totalUnits,
      currentValue,
      pnl,
      returnPct,
      firstInvestmentDate,
      yearsInvested,
      lastBuyDelta
    };
  }, [transactions, currentPrice]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    metrics
  };
}

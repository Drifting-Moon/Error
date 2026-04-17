import { useState, useMemo, useEffect } from 'react';

export function usePortfolio(ticker, currentPrice, chartData) {
  // Store shape: { AAPL: [...], SPY: [...] }
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolioHistory');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading portfolio history:", e);
      return {};
    }
  });

  const [xirr, setXirr] = useState(0);

  // Persist to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('portfolioHistory', JSON.stringify(history));
  }, [history]);

  // Fetch XIRR from backend whenever transactions change
  useEffect(() => {
    const fetchXirr = async () => {
      const txs = history[ticker] || [];
      if (txs.length === 0) {
        setXirr(0);
        return;
      }

      try {
        const totalUnits = txs.reduce((acc, tx) => acc + Number(tx.units), 0);
        const curValue = totalUnits * (currentPrice || 0);

        const response = await fetch('http://127.0.0.1:8000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: txs.map(tx => ({ date: tx.date, amount: Number(tx.amount) })),
            current_value: curValue
          })
        });

        if (response.ok) {
          const data = await response.ok ? await response.json() : { xirr: 0 };
          setXirr(data.xirr || 0);
        }
      } catch (err) {
        console.error("Error fetching XIRR:", err);
      }
    };

    const timer = setTimeout(fetchXirr, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [history, ticker, currentPrice]);

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

  const applyStepStrategy = (stepPct, amountPerBuy) => {
    if (transactions.length === 0 || !chartData || chartData.length === 0) return;
    
    // START FROM THE LATEST TRANSACTION (so we don't wipe previous ones)
    const lastTx = transactions[transactions.length - 1];
    const startIndex = chartData.findIndex(d => d.time === lastTx.date);
    
    if (startIndex === -1) return;

    let localPeak = lastTx.price;
    const newSteps = [];

    for (let i = startIndex + 1; i < chartData.length; i++) {
      const currentData = chartData[i];
      const curP = currentData.value || currentData.close || 0;
      
      if (curP > localPeak) {
        localPeak = curP;
      }

      const dropFromPeak = ((curP - localPeak) / localPeak) * 100;

      if (dropFromPeak <= -stepPct) {
        newSteps.push({
          id: `auto-${i}-${Date.now()}`,
          date: currentData.time,
          price: curP,
          amount: amountPerBuy,
          units: amountPerBuy / curP
        });
        localPeak = curP; // Reset peak after purchase
      }
    }

    if (newSteps.length === 0) return;

    setHistory(prev => ({
      ...prev,
      [ticker]: [...(prev[ticker] || []), ...newSteps].sort((a,b) => new Date(a.date) - new Date(b.date))
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
    const averageBuyPrice = totalUnits > 0 ? totalInvested / totalUnits : 0;

    let firstInvestmentDate = null;
    let yearsInvested = 0;
    let durationDetailed = { years: 0, months: 0 };
    let lastBuyDelta = null;

    if (transactions.length > 0) {
      firstInvestmentDate = transactions[0].date;
      const start = new Date(transactions[0].date);
      const now = new Date();
      yearsInvested = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
      
      const yStr = Math.floor(yearsInvested);
      const mStr = Math.floor((yearsInvested - yStr) * 12);
      durationDetailed = { years: yStr, months: mStr };

      if (transactions.length >= 2) {
        const lastPrice = transactions[transactions.length - 1].price;
        const prevPrice = transactions[transactions.length - 2].price;
        lastBuyDelta = ((lastPrice - prevPrice) / prevPrice) * 100;
      }
    }

    // CAGR Simulation for comparison
    let dcaOutperformance = null;
    let priceDropPct = 0;
    let cagr = 0;
    
    if (transactions.length > 0 && chartData && chartData.length > 0) {
      const firstDate = transactions[0].date;
      const relevantData = chartData.filter(d => d.time >= firstDate);
      
      // Calculate current drop from peak
      const peak = chartData.reduce((max, d) => (d.value || d.close) > max ? (d.value || d.close) : max, 0);
      priceDropPct = peak > 0 ? ((currentPrice - peak) / peak) * 100 : 0;

      // CAGR: ((Final / Initial) ^ (1/Years)) - 1
      if (totalInvested > 0 && yearsInvested > 0.08) { // Only calculate if > 1 month
        cagr = (Math.pow(currentValue / totalInvested, 1 / yearsInvested) - 1) * 100;
      }

      // Sample monthly (roughly every 21 trading days)
      const dcaPoints = [];
      for (let i = 0; i < relevantData.length; i += 21) {
        dcaPoints.push(relevantData[i]);
      }
      
      if (dcaPoints.length > 0) {
        const amountPerMonth = totalInvested / dcaPoints.length;
        let dcaTotalUnits = 0;
        dcaPoints.forEach(p => {
          const price = p.value || p.close || 0;
          if (price > 0) {
            dcaTotalUnits += amountPerMonth / price;
          }
        });
        
        const dcaCurrentValue = dcaTotalUnits * (currentPrice || 0);
        dcaOutperformance = dcaCurrentValue > 0 ? ((currentValue - dcaCurrentValue) / dcaCurrentValue) * 100 : 0;
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
      durationDetailed,
      lastBuyDelta,
      averageBuyPrice,
      dcaOutperformance,
      priceDropPct,
      cagr,
      xirr
    };
  }, [transactions, currentPrice, chartData, xirr]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    applyStepStrategy,
    metrics
  };
}

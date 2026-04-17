import { SummaryCard } from './SummaryCard';
import { TransactionList } from './TransactionList';
import { Zap, Play } from 'lucide-react';
import { useState } from 'react';

export function Sidebar({ metrics, transactions, onDelete, onClearAll, defaultAmount, setDefaultAmount, onStepStrategy }) {
  const [stepPct, setStepPct] = useState(2);
  const [batchAmount, setBatchAmount] = useState(1000);

  return (
    <div className="h-screen flex flex-col bg-[#0b0f19] border-l border-slate-800/50 shadow-2xl">
      <div className="p-4 pb-3 border-b border-slate-800/50">
        <h2 className="text-lg font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          Portfolio Insights
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Real-time Backtest Summary</p>
      </div>

      <div className="flex-grow overflow-y-auto px-4 py-4 flex flex-col gap-4 custom-scrollbar">
        <SummaryCard metrics={metrics} />

        {/* Strategy Automator Card */}
        <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
             <span className="text-blue-400 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5">
               <Zap size={14} fill="currentColor" /> Strategy Automator
             </span>
             <span className="bg-blue-500/10 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Experimental</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Step %</label>
              <input 
                type="number"
                value={stepPct}
                onChange={(e) => setStepPct(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">₹ Per Buy</label>
              <input 
                type="number"
                value={batchAmount}
                onChange={(e) => setBatchAmount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <button 
            onClick={() => onStepStrategy(stepPct, batchAmount)}
            disabled={transactions.length === 0}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-tighter transition-all shadow-lg ${
              transactions.length === 0 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play size={14} fill="currentColor" />
            Auto-Fill 2% Steps
          </button>
          
          <p className="text-[9px] text-slate-500 mt-2 leading-tight">
            Select a starting point on the chart first, then click to automate buys at every {stepPct}% drop.
          </p>
        </div>
        
        <TransactionList 
          transactions={transactions}
          onDelete={onDelete}
          onClearAll={onClearAll}
          defaultAmount={defaultAmount}
          setDefaultAmount={setDefaultAmount}
        />
      </div>
    </div>
  );
}

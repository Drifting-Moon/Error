import { TrendingUp, TrendingDown, IndianRupee, Briefcase, Clock, Hourglass, Percent } from 'lucide-react';
import { formatDateReadable } from '../utils/dateUtils';

export function SummaryCard({ metrics }) {
  const { totalInvested, currentValue, pnl, returnPct, firstInvestmentDate, yearsInvested, lastBuyDelta } = metrics;

  const isPositive = pnl >= 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-start shadow-sm">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Briefcase size={14} /> Invested
        </span>
        <span className="text-xl font-bold text-slate-100">₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-start shadow-sm">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
          <IndianRupee size={14} /> Value
        </span>
        <span className="text-xl font-bold text-slate-100">₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className={`col-span-2 bg-slate-900 border p-4 rounded-xl flex items-center justify-between shadow-sm ${isPositive ? 'border-green-500/30' : 'border-red-500/30'}`}>
        <div className="flex flex-col items-start">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Return
          </span>
          <span className={`text-2xl font-bold flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}₹{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
        </div>
      </div>

      {firstInvestmentDate && (
        <div className="col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock size={12} /> First Buy
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {formatDateReadable(firstInvestmentDate)}
              </span>
            </div>
            <div className="flex flex-col items-start bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Hourglass size={12} /> Duration
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {yearsInvested.toFixed(2)} Years
              </span>
            </div>
          </div>

          {lastBuyDelta !== null && (
            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Percent size={12} /> Last 2 Buy Diff
              </span>
              <span className={`text-sm font-bold ${lastBuyDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {lastBuyDelta >= 0 ? '↗' : '↘'} {Math.abs(lastBuyDelta).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

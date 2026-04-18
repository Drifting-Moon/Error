import { TrendingUp, TrendingDown, IndianRupee, Briefcase, Clock, Hourglass, Percent, Box } from 'lucide-react';

export function SummaryCard({ metrics }) {
  const {
    totalInvested, currentValue, pnl, returnPct,
    firstInvestmentDate, durationDetailed, lastBuyDelta,
    averageBuyPrice, dcaOutperformance, priceDropPct, cagr, xirr
  } = metrics;

  const isPositive = pnl >= 0;

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-start shadow-sm">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <Briefcase size={12} /> Invested
        </span>
        <span className="text-lg font-bold text-slate-100">₹{totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        {averageBuyPrice > 0 && (
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Avg: ₹{averageBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-start shadow-sm">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <IndianRupee size={12} /> Value
        </span>
        <span className="text-lg font-bold text-slate-100">₹{currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>

      <div className={`col-span-2 bg-slate-900 border p-3 rounded-xl flex items-center justify-between shadow-sm ${isPositive ? 'border-green-500/20' : 'border-red-500/20'}`}>
        <div className="flex flex-col items-start font-sans">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Return</span>
          <span className={`text-xl font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}₹{pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {returnPct.toFixed(1)}%
          </div>
          <div className="flex flex-col items-end gap-1">
            {xirr !== 0 && (
              <div className="text-[9px] font-black text-white bg-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                {xirr.toFixed(1)}% Personal ROI (XIRR)
              </div>
            )}
            {cagr !== 0 && (
              <div className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter border border-slate-700">
                {cagr.toFixed(1)}% Compounded (CAGR)
              </div>
            )}
          </div>
        </div>
      </div>

      {priceDropPct < -5 && (
        <div className="col-span-2 bg-orange-500/5 border border-orange-500/20 p-2 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-orange-400" />
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-tighter">Dip Discovery: {Math.abs(priceDropPct).toFixed(1)}% Off Peak</span>
          </div>
          <span className="bg-orange-600 text-[8px] text-white font-black px-1.5 py-0.5 rounded uppercase">Buy Mode</span>
        </div>
      )}

      {firstInvestmentDate && (
        <div className="col-span-2 flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Hourglass size={10} /> Duration
              </span>
              <span className="text-xs font-bold text-slate-300">
                {durationDetailed.years}y {durationDetailed.months}m
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Percent size={10} /> Last Buy Delta
              </span>
              <span className={`text-xs font-bold ${lastBuyDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {lastBuyDelta >= 0 ? '↗' : '↘'} {Math.abs(lastBuyDelta).toFixed(1)}%
              </span>
            </div>
          </div>

          {dcaOutperformance !== null && (
            <div className={`p-2.5 rounded-xl border ${dcaOutperformance >= 0 ? 'border-blue-500/10 bg-blue-500/5' : 'border-orange-500/10 bg-orange-500/5'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-tighter flex items-center gap-1">
                  <Box size={10} className="text-blue-500" /> Strategy Analysis
                </span>
                <span className={`text-[10px] font-black ${dcaOutperformance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {dcaOutperformance >= 0 ? 'Outperforming' : 'Lagging'} vs DCA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Your manual timing is <span className="text-slate-200 font-bold">{Math.abs(dcaOutperformance).toFixed(1)}%</span> {dcaOutperformance >= 0 ? 'better' : 'worse'} than a simple monthly buy.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

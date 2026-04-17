import { Trash2, History, Eraser } from 'lucide-react';
import { formatDateReadable } from '../utils/dateUtils';

export function TransactionList({ transactions, onDelete, onClearAll, defaultAmount, setDefaultAmount }) {
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear ALL transactions for this ticker? This cannot be undone.")) {
      onClearAll();
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-100 text-xs font-black flex items-center gap-2 uppercase tracking-tighter">
            <History size={14} className="text-blue-500" />
            Trade History
          </h3>
          {transactions.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-[10px] font-black text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors hover:bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount </label>
          <input 
            type="number"
            value={defaultAmount}
            onChange={(e) => setDefaultAmount(Number(e.target.value))}
            className="flex-grow bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-bold"
            min="1"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[300px] p-1.5 custom-scrollbar bg-slate-950/20">
        {transactions.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {transactions.slice().reverse().map(tx => (
              <div key={tx.id} className="bg-slate-950/40 hover:bg-slate-800/30 transition-colors border border-slate-800/30 rounded-lg px-2.5 py-2 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-200">{formatDateReadable(tx.date)}</span>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {tx.units.toFixed(4)} Units @ ₹{tx.price.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-300">
                    ₹{tx.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

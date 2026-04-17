import { Trash2, History, Eraser } from 'lucide-react';
import { formatDateReadable } from '../utils/dateUtils';

export function TransactionList({ transactions, onDelete, onClearAll, defaultAmount, setDefaultAmount }) {
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear ALL transactions for this ticker? This cannot be undone.")) {
      onClearAll();
    }
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-100 font-semibold flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            Trade History
          </h3>
          {transactions.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors hover:bg-red-500/10 px-2 py-1 rounded"
            >
              <Trash2 size={12} />
              Clear All
            </button>
          )}
        </div>
        
        <div className="flex flex-col gap-1.5 shadow-sm">
          <label className="text-xs font-medium text-slate-400">Default Buy Amount (₹)</label>
          <input 
            type="number"
            value={defaultAmount}
            onChange={(e) => setDefaultAmount(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            min="1"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Click anywhere on the chart to simulate buying at that historical price.
        </p>
      </div>

      <div className="flex-grow overflow-y-auto p-2">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
            <p>No transactions yet.</p>
            <p>Click the chart to start.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.slice().reverse().map(tx => (
              <div key={tx.id} className="bg-slate-950/50 hover:bg-slate-800/50 transition-colors border border-slate-800/50 rounded-lg p-3 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">{formatDateReadable(tx.date)}</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Bought {tx.units.toFixed(4)} @ ₹{tx.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-300">
                    ₹{tx.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={16} />
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

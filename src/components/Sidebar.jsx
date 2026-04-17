import { SummaryCard } from './SummaryCard';
import { TransactionList } from './TransactionList';

export function Sidebar({ metrics, transactions, onDelete, onClearAll, defaultAmount, setDefaultAmount }) {
  return (
    <div className="h-full flex flex-col p-6 bg-slate-950 border-l border-slate-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">Portfolio Summary</h2>
        <p className="text-sm text-slate-400">Track your simulated returns</p>
      </div>

      <SummaryCard metrics={metrics} />
      
      <TransactionList 
        transactions={transactions}
        onDelete={onDelete}
        onClearAll={onClearAll}
        defaultAmount={defaultAmount}
        setDefaultAmount={setDefaultAmount}
      />
    </div>
  );
}

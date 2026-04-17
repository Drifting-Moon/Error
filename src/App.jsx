import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChartWrapper } from './components/ChartWrapper';
import { Sidebar } from './components/Sidebar';
import { usePortfolio } from './hooks/usePortfolio';
import { Box, LineChart, Upload, Search, Loader2, AlertCircle, Calendar, Pin, PinOff, X } from 'lucide-react';
import { parseFinanceCSV } from './utils/csvParser';
import { formatDateReadable } from './utils/dateUtils';

const INITIAL_TICKS = ['AAPL', 'SPY', '^NSEI', 'TSLA'];

function App() {
  const [navTickers, setNavTickers] = useState(() => {
    try {
      const saved = localStorage.getItem('navTickers');
      return saved ? JSON.parse(saved) : INITIAL_TICKS;
    } catch { return INITIAL_TICKS; }
  });
  
  const [ticker, setTicker] = useState(navTickers[0] || 'AAPL');
  const [searchInput, setSearchInput] = useState('');
  
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [defaultAmount, setDefaultAmount] = useState(1000);
  const [customCharts, setCustomCharts] = useState({});
  const fileInputRef = useRef(null);

  const togglePin = (t) => {
    setNavTickers(prev => {
      const next = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t];
      localStorage.setItem('navTickers', JSON.stringify(next));
      return next;
    });
  };

  const removeTicker = (t, e) => {
    e.stopPropagation();
    setNavTickers(prev => {
      const next = prev.filter(x => x !== t);
      localStorage.setItem('navTickers', JSON.stringify(next));
      // If we removed the active ticker, switch to another one
      if (ticker === t) {
        setTicker(next[0] || '');
      }
      return next;
    });
  };

  const fetchData = useCallback(async (targetTicker) => {
    if (customCharts[targetTicker]) {
      setChartData(customCharts[targetTicker]);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/history/${targetTicker}`);
      if (!response.ok) {
        const d = await response.json().catch(() => ({}));
        throw new Error(d.detail || `Failed to fetch data for ${targetTicker}`);
      }
      const json = await response.json();
      setChartData(json.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setChartData([]); 
    } finally {
      setIsLoading(false);
    }
  }, [customCharts]);

  useEffect(() => {
    if (!ticker) return;
    // Wrap in microtask to avoid synchronous state-in-effect warning
    Promise.resolve().then(() => fetchData(ticker));
  }, [ticker, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setTicker(searchInput.toUpperCase());
    setSearchInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    parseFinanceCSV(file, (data, filename) => {
      setCustomCharts(prev => ({...prev, [filename]: data}));
      setTicker(filename);
    }, (err) => {
      alert("Error parsing CSV: " + err.message);
    });
    
    e.target.value = '';
  };

  const currentPrice = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].value || chartData[chartData.length - 1].close || 0;
  }, [chartData]);

  const timeRange = useMemo(() => {
    if (chartData.length < 2) return null;
    return {
      start: formatDateReadable(chartData[0].time),
      end: formatDateReadable(chartData[chartData.length - 1].time)
    };
  }, [chartData]);

  const { transactions, addTransaction, deleteTransaction, clearTransactions, metrics } = usePortfolio(ticker, currentPrice);

  const handleChartClick = useCallback((timeStr, price) => {
    addTransaction(timeStr, price, defaultAmount);
  }, [addTransaction, defaultAmount]);

  return (
    <div className="w-full h-screen flex overflow-hidden font-sans">
      <div className="flex-grow flex flex-col pt-6 px-6 bg-[#0b0f19]">
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
              <LineChart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                SimuTrade
              </h1>
              <p className="text-slate-400 text-sm font-medium">Historical Backtesting Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <form onSubmit={handleSearch} className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500 mr-2">
              <div className="pl-3 text-slate-400"><Search size={16} /></div>
              <input 
                type="text" 
                placeholder="Search Ticker... (e.g. MSFT)" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-200 px-3 py-1.5 w-48 font-medium placeholder-slate-600"
              />
            </form>

            <button
              onClick={() => togglePin(ticker)}
              className={`p-2 rounded-lg border transition-all ${
                navTickers.includes(ticker)
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
              title={navTickers.includes(ticker) ? "Remove from Nav" : "Add to Nav"}
            >
              {navTickers.includes(ticker) ? <PinOff size={18} /> : <Pin size={18} />}
            </button>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg max-w-[500px] overflow-hidden">
              {navTickers.map(t => (
                <div key={t} className="relative group">
                  <button
                    onClick={() => setTicker(t)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                      ticker === t 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                  <button 
                    onClick={(e) => removeTicker(t, e)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg border border-slate-900"
                    title="Remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {Object.keys(customCharts).filter(t => !navTickers.includes(t)).map(t => (
                <button
                  key={t}
                  onClick={() => setTicker(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    ticker === t 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}

              <div className="w-px h-6 bg-slate-700 mx-1 shrink-0"></div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <Upload size={16} />
                CSV
              </button>
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mb-4 px-2 h-12">
          {!isLoading && !errorMsg && (
            <>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-slate-100">₹{currentPrice.toFixed(2)}</span>
                <span className="text-slate-500 font-semibold mb-1 uppercase tracking-wider">{ticker} Latest Price</span>
              </div>
              {timeRange && (
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50 mb-1">
                  <Calendar size={14} className="text-blue-400" />
                  <span className="text-xs font-medium uppercase tracking-tighter">
                    {timeRange.start} — {timeRange.end}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-grow bg-slate-900/50 border border-slate-800 rounded-t-2xl shadow-lg relative p-2 overflow-hidden flex flex-col justify-center items-center">
          {isLoading ? (
             <div className="flex flex-col items-center gap-3 text-slate-400">
               <Loader2 size={32} className="animate-spin text-blue-500" />
               <p className="font-semibold">Fetching data from Yahoo Finance...</p>
             </div>
          ) : errorMsg ? (
             <div className="flex flex-col items-center gap-3 text-red-400 max-w-sm text-center">
               <AlertCircle size={32} />
               <p className="font-semibold">{errorMsg}</p>
             </div>
          ) : chartData.length > 0 ? (
             <ChartWrapper data={chartData} onChartClick={handleChartClick} transactions={transactions} />
          ) : (
             <p className="text-slate-500 font-semibold">No data available.</p>
          )}
        </div>
      </div>

      <div className="w-[400px] shrink-0 border-l border-slate-800 shadow-2xl relative z-10">
        <Sidebar 
          metrics={metrics}
          transactions={transactions}
          onDelete={deleteTransaction}
          onClearAll={clearTransactions}
          defaultAmount={defaultAmount}
          setDefaultAmount={setDefaultAmount}
        />
      </div>

    </div>
  );
}

export default App;

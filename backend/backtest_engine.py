import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from finance_utils import xirr 

class BacktestEngine:
    def __init__(self, ticker):
        self.ticker = ticker
        self.data = None
        
    def fetch_data(self):
        print(f"Fetching data for {self.ticker}...")
        # Use period='max' to get historical data
        df = yf.download(self.ticker, period="max")
        
        if df.empty:
            raise ValueError(f"No data found for {self.ticker}")
            
        # Strictly use Adj Close
        if 'Adj Close' not in df.columns:
            print("Warning: 'Adj Close' column missing. Falling back to 'Close'.")
            df['Price'] = df['Close']
        else:
            df['Price'] = df['Adj Close']
            
        # Ensure dates are sorted and timezone naive for simplicity in calculations
        df.index = pd.to_datetime(df.index).tz_localize(None)
        df.sort_index(inplace=True)
        self.data = df
        return df

    def run_sip(self, start_date, end_date, monthly_amount=10000):
        df = self.data.loc[start_date:end_date]
        if df.empty:
            return None

        cash_flows = []
        dates = []
        total_units = 0
        total_invested = 0
        
        # Generate monthly dates
        current_date = pd.to_datetime(start_date)
        target_end = pd.to_datetime(end_date)
        
        while current_date <= target_end:
            # Find the nearest available trading day (exact or next)
            available_dates = df.index[df.index >= current_date]
            if len(available_dates) == 0:
                break
                
            trading_day = available_dates[0]
            price = float(df.loc[trading_day, 'Price'].iloc[0]) if isinstance(df.loc[trading_day, 'Price'], pd.Series) else float(df.loc[trading_day, 'Price'])
            
            units = monthly_amount / price
            total_units += units
            total_invested += monthly_amount
            
            # Cash flow for XIRR (outflow is negative)
            cash_flows.append(-monthly_amount)
            dates.append(trading_day)
            
            # Increment month
            current_date = current_date + pd.DateOffset(months=1)

        # Terminal cash flow (Portfolio value as positive inflow)
        final_price = float(df.iloc[-1]['Price'].iloc[0]) if isinstance(df.iloc[-1]['Price'], pd.Series) else float(df.iloc[-1]['Price'])
        final_value = total_units * final_price
        
        cash_flows.append(final_value)
        dates.append(df.index[-1])
        
        xirr_val = xirr(cash_flows, dates)
        
        return {
            "total_invested": total_invested,
            "total_units": total_units,
            "final_value": final_value,
            "xirr_pct": xirr_val * 100
        }

    def run_lump_sum(self, start_date, end_date, initial_investment=1000000):
        df = self.data.loc[start_date:end_date]
        if df.empty:
            return None
            
        start_price = float(df.iloc[0]['Price'].iloc[0]) if isinstance(df.iloc[0]['Price'], pd.Series) else float(df.iloc[0]['Price'])
        end_price = float(df.iloc[-1]['Price'].iloc[0]) if isinstance(df.iloc[-1]['Price'], pd.Series) else float(df.iloc[-1]['Price'])
        
        units = initial_investment / start_price
        final_value = units * end_price
        
        years = (df.index[-1] - df.index[0]).days / 365.25
        cagr = (pow(final_value / initial_investment, 1/years) - 1) * 100 if years > 0 else 0
        
        return {
            "total_invested": initial_investment,
            "total_units": units,
            "final_value": final_value,
            "cagr_pct": cagr
        }

def run_performance_test():
    # Backtest NIFTY 50 (^NSEI) or SENSEX (^BSESN) for the last 20 years
    # SENSEX usually has better adj close data history
    ticker = "^BSESN" 
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=20*365)).strftime("%Y-%m-%d")
    
    bt = BacktestEngine(ticker)
    bt.fetch_data()
    
    print(f"\n{'='*50}")
    print(f"VERIFICATION REPORT: {ticker}")
    print(f"Timeframe: {start_date} to {end_date} (20 Years)")
    print(f"{'='*50}")

    # SIP Backtest
    sip = bt.run_sip(start_date, end_date, monthly_amount=10000)
    print("\n[MONTHLY SIP STRATEGY]")
    print(f"Total Invested:      ₹{sip['total_invested']:,}")
    print(f"Total Units:         {sip['total_units']:.2f}")
    print(f"Final Portfolio Val: ₹{sip['final_value']:,.2f}")
    print(f"XIRR Return:         {sip['xirr_pct']:.2f}%")

    # Lump Sum Backtest
    ls_amount = 1000000 # 10 Lakhs
    ls = bt.run_lump_sum(start_date, end_date, initial_investment=ls_amount)
    print("\n[LUMP SUM STRATEGY]")
    print(f"Total Invested:      ₹{ls['total_invested']:,}")
    print(f"Total Units:         {ls['total_units']:.2f}")
    print(f"Final Portfolio Val: ₹{ls['final_value']:,.2f}")
    print(f"CAGR Return:         {ls['cagr_pct']:.2f}%")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    run_performance_test()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this strictly to the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/history/{ticker}")
def get_historical_data(ticker: str):
    try:
        # Fetch the maximum available historical data from yfinance
        stock = yf.Ticker(ticker)
        df = stock.history(period="max")
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'")
            
        # Reset index to access Date cleanly
        df = df.reset_index()
        
        # Convert date column into 'YYYY-MM-DD' formatted strings
        # yfinance normally returns timezone-aware datetime index named 'Date'
        
        result = []
        for _, row in df.iterrows():
            date_str = row['Date'].strftime('%Y-%m-%d')
            # Extract closing price
            close_price = round(float(row['Close']), 2)
            
            result.append({
                "time": date_str,
                "value": close_price,
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": close_price
            })
            
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

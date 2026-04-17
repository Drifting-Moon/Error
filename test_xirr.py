from backend.finance_utils import xirr
from datetime import datetime

dates = [datetime(2020, 1, 1), datetime(2026, 4, 17)]
cfs = [-1000, 2000]

print("Starting XIRR calc...")
res = xirr(cfs, dates)
print(f"XIRR Result: {res * 100:.2f}%")

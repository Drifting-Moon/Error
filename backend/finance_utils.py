import datetime

def xirr(cash_flows, dates):
    """
    Calculates the Internal Rate of Return (IRR) for irregular cash flows.
    Uses Newton-Raphson method.
    cash_flows: List of cash flows (negative for investment, positive for returns)
    dates: List of corresponding datetime objects
    """
    if len(cash_flows) != len(dates):
        raise ValueError("Cash flows and dates must have the same length")

    # Newton-Raphson implementation
    def npv(rate, cash_flows, dates):
        total_npv = 0.0
        start_date = dates[0]
        for cf, date in zip(cash_flows, dates):
            years = (date - start_date).days / 365.0
            try:
                total_npv += cf / (1 + rate)**years
            except ZeroDivisionError:
                total_npv += cf
        return total_npv

    def npv_derivative(rate, cash_flows, dates):
        total_deriv = 0.0
        start_date = dates[0]
        for cf, date in zip(cash_flows, dates):
            years = (date - start_date).days / 365.0
            try:
                total_deriv += -years * cf / (1 + rate)**(years + 1)
            except ZeroDivisionError:
                total_deriv += 0
        return total_deriv

    # Initial guess (10%)
    rate = 0.1
    for _ in range(100):
        try:
            f_val = npv(rate, cash_flows, dates)
            f_deriv = npv_derivative(rate, cash_flows, dates)
            
            if abs(f_deriv) < 1e-10:
                break
                
            new_rate = rate - f_val / f_deriv
            
            if abs(new_rate - rate) < 1e-6:
                return new_rate
            rate = new_rate
        except Exception:
            break
        
    return rate

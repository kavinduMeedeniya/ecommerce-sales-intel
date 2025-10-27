import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings('ignore')

def forecast_monthly_revenue(df):
    """Forecast next month's revenue using ARIMA."""
    # Group by MonthYear (PeriodIndex) and sum revenue
    monthly = df.groupby('MonthYear')['Revenue'].sum()
    
    # Convert PeriodIndex to DatetimeIndex (start of month)
    monthly = monthly.to_timestamp().asfreq('MS').fillna(0)
    
    # Ensure index is DatetimeIndex
    monthly.index = pd.to_datetime(monthly.index)
    
    # Fit ARIMA (simple order; tune p,d,q in production)
    model = ARIMA(monthly, order=(1,1,1))
    fitted = model.fit()
    
    # Forecast next month
    forecast = fitted.forecast(steps=1)
    next_month = monthly.index[-1] + pd.DateOffset(months=1)
    
    # Confidence interval (approx 95%)
    conf_int = fitted.get_forecast(steps=1).conf_int()
    
    return {
        'predicted_revenue': round(forecast.iloc[0], 2),
        'next_month': next_month.strftime('%Y-%m'),
        'lower_ci': round(conf_int.iloc[0, 0], 2),
        'upper_ci': round(conf_int.iloc[0, 1], 2),
        'historical': monthly.to_dict()
    }
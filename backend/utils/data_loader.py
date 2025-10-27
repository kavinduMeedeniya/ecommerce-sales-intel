import pandas as pd
from datetime import datetime
import os

def load_and_clean_data(file_path='sales_data_sample.csv'):
    """
    Load CSV, handle missing/duplicates, convert dates, add Revenue if needed.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found.")
    
    df = pd.read_csv(file_path, encoding='utf-8')
    
    # Handle duplicates
    initial_rows = len(df)
    df = df.drop_duplicates()
    print(f"Removed {initial_rows - len(df)} duplicates.")
    
    # Handle missing values
    df['ADDRESSLINE2'] = df['ADDRESSLINE2'].fillna('Unknown')
    df['STATE'] = df['STATE'].fillna('Unknown')
    df['POSTALCODE'] = df['POSTALCODE'].fillna('Unknown')
    df['TERRITORY'] = df['TERRITORY'].fillna('Unknown')
    # Drop rows with missing sales-critical fields (rare)
    initial_rows_clean = len(df)
    df = df.dropna(subset=['SALES', 'ORDERDATE', 'QUANTITYORDERED', 'PRICEEACH'])
    print(f"Dropped {initial_rows_clean - len(df)} rows with missing critical fields.")
    
    # Calculate revenue for verification (but use SALES as primary)
    df['Calculated_Revenue'] = df['QUANTITYORDERED'] * df['PRICEEACH']
    mismatches = (abs(df['SALES'] - df['Calculated_Revenue']) >= 0.01).sum()
    if mismatches > 0:
        print(f"Warning: {mismatches} rows have SALES mismatch with QUANTITY * PRICEEACH (using SALES as Revenue).")
    
    # Use existing SALES as Revenue (more accurate for this dataset)
    df['Revenue'] = df['SALES']
    
    # Convert dates
    df['ORDERDATE'] = pd.to_datetime(df['ORDERDATE'], format='%m/%d/%Y %H:%M')
    
    # Add month-year for grouping
    df['MonthYear'] = df['ORDERDATE'].dt.to_period('M')
    
    print(f"Data loaded: {len(df)} rows, spanning {df['MonthYear'].nunique()} months ({df['ORDERDATE'].dt.year.min()}-{df['ORDERDATE'].dt.year.max()}).")
    return df

if __name__ == "__main__":
    df = load_and_clean_data()
    print(df.shape, df.dtypes)
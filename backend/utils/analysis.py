import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from difflib import get_close_matches  # For fuzzy query matching
import re  # For simple date/year extraction

def monthly_sales(df):
    """Total sales by month line chart data."""
    monthly = df.groupby('MonthYear')['Revenue'].sum().reset_index()
    monthly['MonthYear'] = monthly['MonthYear'].dt.to_timestamp()
    fig = px.line(monthly, x='MonthYear', y='Revenue', title='Total Sales by Month')
    return fig.to_json()

def top_products(df, top_n=10):
    """Top-selling products bar chart."""
    top_prod = df.groupby('PRODUCTCODE')['Revenue'].sum().nlargest(top_n).reset_index()
    fig = px.bar(top_prod, x='PRODUCTCODE', y='Revenue', title='Top Products')
    return fig.to_json()

def top_product_lines(df, top_n=5):
    """Top product lines bar chart."""
    top_lines = df.groupby('PRODUCTLINE')['Revenue'].sum().nlargest(top_n).reset_index()
    fig = px.bar(top_lines, x='PRODUCTLINE', y='Revenue', title='Top Product Lines')
    return fig.to_json()

def revenue_by_country(df):
    """Revenue by country pie chart."""
    country_rev = df.groupby('COUNTRY')['Revenue'].sum().reset_index()
    fig = px.pie(country_rev, values='Revenue', names='COUNTRY', title='Revenue by Country')
    return fig.to_json()

def kpis(df):
    """Calculate KPIs."""
    total_rev = df['Revenue'].sum()
    total_orders = df['ORDERNUMBER'].nunique()
    avg_order_val = total_rev / total_orders if total_orders > 0 else 0
    return {
        'total_revenue': round(total_rev, 2),
        'total_orders': total_orders,
        'avg_order_value': round(avg_order_val, 2)
    }

def filtered_data(df, date_start=None, date_end=None, product_line=None, country=None):
    """Apply filters."""
    filtered = df.copy()
    if date_start and date_start.strip():  # Skip if empty string
        try:
            filtered = filtered[filtered['ORDERDATE'] >= pd.to_datetime(date_start)]
        except ValueError:
            print(f"Invalid date_start '{date_start}'—skipping filter.")
    if date_end and date_end.strip():  # Skip if empty string
        try:
            filtered = filtered[filtered['ORDERDATE'] <= pd.to_datetime(date_end)]
        except ValueError:
            print(f"Invalid date_end '{date_end}'—skipping filter.")
    if product_line and product_line.strip():
        filtered = filtered[filtered['PRODUCTLINE'] == product_line]
    if country and country.strip():
        filtered = filtered[filtered['COUNTRY'] == country]
    return filtered

def handle_query(df, query):
    """AI-like query handler: Detects intent via keywords/fuzzy match, computes dynamically, responds conversationally."""
    query_lower = query.lower().strip()
    words = query_lower.split()
    
    # Fuzzy match helper for flexible phrasing
    def fuzzy_match(targets, words, threshold=0.6):
        matches = get_close_matches(' '.join(words), targets, n=1, cutoff=threshold)
        return matches[0] if matches else None
    
    # Define intents with keywords/phrases
    intents = {
        'total_revenue': ['total revenue', 'overall sales', 'total sales', 'how much money', 'gross revenue'],
        'top_products': ['top products', 'best selling products', 'popular items', 'highest revenue products'],
        'top_customers': ['top customers', 'best customers', 'highest spending customers', 'top buyers'],
        'revenue_by_country': ['revenue by country', 'sales by country', 'where most sales', 'country breakdown'],
        'revenue_by_product_line': ['sales by product line', 'revenue by category', 'product line performance'],
        'average_order': ['average order value', 'avg order', 'typical order size'],
        'orders_count': ['total orders', 'number of orders', 'how many orders'],
        'sales_by_year': ['sales by year', 'yearly revenue', 'annual sales'],
        'this_month': ['this month', 'current month sales', 'latest month'],
        'help': ['help', 'what can you do', 'examples']
    }
    
    # Detect intent
    detected_intent = None
    for intent, phrases in intents.items():
        if fuzzy_match(phrases, words):
            detected_intent = intent
            break
    
    # Extract extras (e.g., year, month)
    year_match = re.search(r'\b(200[3-5])\b', query_lower)  # Dataset years
    year = int(year_match.group(1)) if year_match else None
    month_match = re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b', query_lower)
    month = month_match.group(1) if month_match else None
    
    # Filter df if year/month specified
    filtered_df = df.copy()
    if year:
        filtered_df = filtered_df[filtered_df['ORDERDATE'].dt.year == year]
        response_prefix = f"In {year}, "
    elif month:
        # Map month abbr to num
        month_map = {'jan':1, 'feb':2, 'mar':3, 'apr':4, 'may':5, 'jun':6, 'jul':7, 'aug':8, 'sep':9, 'oct':10, 'nov':11, 'dec':12}
        filtered_df = filtered_df[filtered_df['ORDERDATE'].dt.month == month_map[month]]
        response_prefix = f"In {month.capitalize()}, "
    else:
        response_prefix = "Based on the full dataset, "
    
    # Generate response based on intent
    if detected_intent == 'total_revenue':
        total = filtered_df['Revenue'].sum()
        response = f"{response_prefix}the total revenue is ${total:,.2f}. That's impressive! Need a breakdown?"
    elif detected_intent == 'top_products':
        top = filtered_df.groupby('PRODUCTCODE')['Revenue'].sum().nlargest(5).to_dict()
        prod_list = ', '.join([f"{k}: ${v:,.0f}" for k,v in top.items()])
        response = f"{response_prefix}the top 5 products by revenue are: {prod_list}. Which one interests you most?"
    elif detected_intent == 'top_customers':
        top = filtered_df.groupby('CUSTOMERNAME')['Revenue'].sum().nlargest(5).to_dict()
        cust_list = ', '.join([f"{k}: ${v:,.0f}" for k,v in top.items()])
        response = f"{response_prefix}the top 5 customers are: {cust_list}. Loyal buyers, right? Want contact info?"
    elif detected_intent == 'revenue_by_country':
        country_rev = filtered_df.groupby('COUNTRY')['Revenue'].sum().round(2).to_dict()
        country_str = ', '.join([f"{k}: ${v:,.0f}" for k,v in sorted(country_rev.items(), key=lambda x: x[1], reverse=True)[:3]])
        response = f"{response_prefix}revenue by country (top 3): {country_str}. The rest? Let me know if you want all."
    elif detected_intent == 'revenue_by_product_line':
        line_rev = filtered_df.groupby('PRODUCTLINE')['Revenue'].sum().round(2).to_dict()
        line_str = ', '.join([f"{k}: ${v:,.0f}" for k,v in line_rev.items()])
        response = f"{response_prefix}revenue by product line: {line_str}. Motorcycles leading the pack!"
    elif detected_intent == 'average_order':
        avg = filtered_df['Revenue'].sum() / filtered_df['ORDERNUMBER'].nunique()
        response = f"{response_prefix}the average order value is ${avg:,.2f}. Solid for e-commerce—tips to boost it?"
    elif detected_intent == 'orders_count':
        count = filtered_df['ORDERNUMBER'].nunique()
        response = f"{response_prefix}there were {count:,} total orders. Growth potential there!"
    elif detected_intent == 'sales_by_year':
        yearly = filtered_df.groupby(filtered_df['ORDERDATE'].dt.year)['Revenue'].sum().round(2).to_dict()
        year_str = ', '.join([f"{k}: ${v:,.0f}" for k,v in yearly.items()])
        response = f"{response_prefix}yearly revenue: {year_str}. Trending up?"
    elif detected_intent == 'this_month':
        latest = filtered_df['MonthYear'].max()
        month_data = filtered_df[filtered_df['MonthYear'] == latest].groupby('PRODUCTCODE')['Revenue'].sum().nlargest(3)
        month_str = ', '.join([f"{k}: ${v:,.0f}" for k,v in month_data.items()])
        response = f"For the latest month ({latest}), top products: {month_str}. Fresh insights!"
    elif detected_intent == 'help':
        response = "I'm your sales AI buddy! Ask about total revenue, top products, sales by country/year, average orders, or top customers. E.g., 'What's revenue in 2004?' or 'Top buyers this month?' What’s on your mind?"
    else:
        response = "Hmm, that's a bit unclear—I'm still learning! Try 'total sales', 'top products', 'revenue by country', or 'help' for ideas. What's your question about the sales data?"
    
    return response
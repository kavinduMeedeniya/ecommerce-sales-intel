from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from utils.data_loader import load_and_clean_data
from utils.analysis import (monthly_sales, top_products, top_product_lines, 
                            revenue_by_country, kpis, filtered_data, handle_query)
from utils.forecasting import forecast_monthly_revenue

app = FastAPI(title="E-commerce Sales API")

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ecommerce-sales-prediction.onrender.com",  # Your frontend URL
        "http://localhost:3000"  # Keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data globally (in production, use caching)
df = load_and_clean_data()

class FilterQuery(BaseModel):
    date_start: str | None = None
    date_end: str | None = None
    product_line: str | None = None
    country: str | None = None

class ChatQuery(BaseModel):
    query: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/kpis")
def get_kpis():
    return kpis(df)

@app.get("/monthly-sales")
def get_monthly_sales():
    return {"chart": monthly_sales(df)}

@app.get("/top-products")
def get_top_products():
    return {"chart": top_products(df)}

@app.get("/top-product-lines")
def get_top_product_lines():
    return {"chart": top_product_lines(df)}

@app.get("/revenue-by-country")
def get_revenue_by_country():
    return {"chart": revenue_by_country(df)}

@app.post("/filtered-data")
def get_filtered_data(filters: FilterQuery):
    filtered_df = filtered_data(df, filters.date_start, filters.date_end, 
                                filters.product_line, filters.country)
    # Return KPIs for filtered
    return kpis(filtered_df)

@app.get("/forecast")
def get_forecast():
    return forecast_monthly_revenue(df)

@app.post("/chat")
def chat(query: ChatQuery):
    response = handle_query(df, query.query)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

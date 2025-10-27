import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { api } from '../services/api';

const SalesTrends = ({ filters }) => {
  const [monthlyChart, setMonthlyChart] = useState({});
  const [topProductsChart, setTopProductsChart] = useState({});
  const [loading, setLoading] = useState({ monthly: true, products: true });
  const [timeRange, setTimeRange] = useState('1y');

  useEffect(() => {
    setLoading({ monthly: true, products: true });
    
    Promise.all([
      api.get('/monthly-sales'),
      api.get('/top-products')
    ]).then(([monthlyRes, productsRes]) => {
      setMonthlyChart(JSON.parse(monthlyRes.data.chart));
      setTopProductsChart(JSON.parse(productsRes.data.chart));
      setLoading({ monthly: false, products: false });
    }).catch(() => {
      setLoading({ monthly: false, products: false });
    });
  }, [filters, timeRange]);

  const chartLayout = {
    font: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#000' },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    margin: { t: 60, r: 40, b: 80, l: 80 },
    hoverlabel: { bgcolor: '#000', font: { color: 'white' } },
    xaxis: {
      gridcolor: '#f0f0f0',
      linecolor: '#000',
      linewidth: 1,
      tickfont: { color: '#666', size: 11 },
      title: { font: { size: 12, color: '#333' } }
    },
    yaxis: {
      gridcolor: '#f0f0f0',
      linecolor: '#000',
      linewidth: 1,
      tickfont: { color: '#666', size: 11 },
      title: { font: { size: 12, color: '#333' } }
    }
  };

  const ChartSkeleton = ({ title, height = 400 }) => (
    <div className="chart-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-controls"></div>
      </div>
      <div className="skeleton-chart" style={{ height: `${height}px` }}></div>
    </div>
  );

  return (
    <div className="sales-trends">
      <div className="trends-header">
        <div className="header-content">
          <h1 className="trends-title">Sales Trends & Analytics</h1>
          <p className="trends-subtitle">
            Performance insights and product analysis
            {Object.keys(filters).some(key => filters[key]) && (
              <span className="filters-badge">Filters Applied</span>
            )}
          </p>
        </div>
        <div className="time-range-selector">
          <label className="time-range-label">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="2y">Last 2 Years</option>
          </select>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Revenue Trend</h3>
            <div className="chart-actions">
              <button className="chart-action-btn">📊</button>
              <button className="chart-action-btn">⤢</button>
            </div>
          </div>
          {loading.monthly ? (
            <ChartSkeleton title="Monthly Revenue Trend" />
          ) : (
            <div className="chart-wrapper">
              <Plot 
                data={monthlyChart.data ? monthlyChart.data.map(trace => ({
                  ...trace,
                  line: { ...trace.line, width: 3 },
                  marker: { ...trace.marker, size: 6 }
                })) : []}
                layout={{
                  ...chartLayout,
                  ...monthlyChart.layout,
                  title: {
                    text: '',
                    font: { size: 16, color: '#000', weight: 'bold' }
                  },
                  height: 400,
                  showlegend: true,
                  legend: {
                    x: 0.02,
                    y: 0.98,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    bordercolor: '#e0e0e0',
                    borderwidth: 1,
                    font: { size: 11, color: '#666' }
                  }
                }}
                config={{
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                  modeBarButtonsToAdd: [],
                  toImageButtonOptions: {
                    format: 'png',
                    filename: 'monthly-revenue-trend',
                    scale: 2
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <div className="chart-footer">
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Peak Month</span>
                <span className="stat-value">{monthlyChart.peak_month || '—'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Growth Rate</span>
                <span className="stat-value positive">+{monthlyChart.growth_rate || '0'}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Top Performing Products</h3>
            <div className="chart-actions">
              <button className="chart-action-btn">📊</button>
              <button className="chart-action-btn">⤢</button>
            </div>
          </div>
          {loading.products ? (
            <ChartSkeleton title="Top Performing Products" height={450} />
          ) : (
            <div className="chart-wrapper">
              <Plot 
                data={topProductsChart.data ? topProductsChart.data.map(trace => ({
                  ...trace,
                  marker: { 
                    ...trace.marker,
                    line: { width: 1, color: '#000' }
                  }
                })) : []}
                layout={{
                  ...chartLayout,
                  ...topProductsChart.layout,
                  title: {
                    text: '',
                    font: { size: 16, color: '#000', weight: 'bold' }
                  },
                  height: 450,
                  showlegend: false,
                  barmode: 'group'
                }}
                config={{
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                  modeBarButtonsToAdd: [],
                  toImageButtonOptions: {
                    format: 'png',
                    filename: 'top-products',
                    scale: 2
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <div className="chart-footer">
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Top Product</span>
                <span className="stat-value">{topProductsChart.top_product || '—'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Products</span>
                <span className="stat-value">{topProductsChart.total_products || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="trends-insights">
        <div className="insights-card">
          <h4>Trend Analysis</h4>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <strong>Seasonal Pattern:</strong> Higher sales typically occur in Q4
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <strong>Growth Driver:</strong> Product line A shows consistent growth
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <strong>Opportunity:</strong> Expand in underperforming regions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTrends;
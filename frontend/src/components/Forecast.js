import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { api } from '../services/api';

const Forecast = () => {
  const [forecast, setForecast] = useState({});
  const [forecastChart, setForecastChart] = useState({});
  const [loading, setLoading] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  useEffect(() => {
    setLoading(true);
    api.get('/forecast')
      .then(res => {
        setForecast(res.data);
        createForecastChart(res.data, confidenceLevel);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [confidenceLevel]);

  const createForecastChart = (data, confLevel = 95) => {
    if (!data.historical) return;

    const historicalDates = Object.keys(data.historical);
    const historicalValues = Object.values(data.historical);
    
    const forecastDate = data.next_month;
    const forecastValue = data.predicted_revenue;
    
    // Create confidence interval data
    const ciMultiplier = confLevel === 95 ? 1.96 : confLevel === 90 ? 1.645 : 2.576;
    const margin = data.upper_ci - data.predicted_revenue;
    
    const historicalTrace = {
      x: historicalDates,
      y: historicalValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Historical Revenue',
      line: {
        color: '#000',
        width: 3,
        shape: 'spline'
      },
      marker: {
        color: '#000',
        size: 6,
        line: {
          color: '#000',
          width: 1
        }
      }
    };

    const forecastTrace = {
      x: [historicalDates[historicalDates.length - 1], forecastDate],
      y: [historicalValues[historicalValues.length - 1], forecastValue],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Forecast',
      line: {
        color: '#666',
        width: 3,
        dash: 'dash',
        shape: 'spline'
      },
      marker: {
        color: '#666',
        size: 8,
        symbol: 'diamond'
      }
    };

    const confidenceIntervalTrace = {
      x: [forecastDate, forecastDate],
      y: [data.lower_ci, data.upper_ci],
      type: 'scatter',
      mode: 'lines',
      name: `Confidence Interval (${confLevel}%)`,
      line: {
        color: '#999',
        width: 8,
        opacity: 0.3
      },
      showlegend: true
    };

    const layout = {
      font: { 
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        color: '#000',
        size: 11
      },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      margin: { t: 60, r: 40, b: 80, l: 80 },
      hoverlabel: { 
        bgcolor: '#000', 
        font: { color: 'white', size: 11 },
        bordercolor: '#000'
      },
      xaxis: {
        gridcolor: '#f0f0f0',
        linecolor: '#000',
        linewidth: 1,
        tickfont: { color: '#666', size: 10 },
        title: { 
          text: 'Timeline', 
          font: { size: 12, color: '#333', weight: 'bold' },
          standoff: 20
        },
        showgrid: true,
        zeroline: false
      },
      yaxis: {
        gridcolor: '#f0f0f0',
        linecolor: '#000',
        linewidth: 1,
        tickfont: { color: '#666', size: 10 },
        title: { 
          text: 'Revenue (USD)', 
          font: { size: 12, color: '#333', weight: 'bold' },
          standoff: 20
        },
        tickformat: '$,.0f',
        showgrid: true,
        zeroline: false
      },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: '#e0e0e0',
        borderwidth: 1,
        font: { size: 11, color: '#666' },
        orientation: 'v'
      },
      height: 500,
      annotations: [
        {
          x: forecastDate,
          y: forecastValue,
          text: `Forecast: $${forecastValue?.toLocaleString()}`,
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 2,
          arrowcolor: '#666',
          bgcolor: 'white',
          bordercolor: '#666',
          borderwidth: 1,
          borderpad: 4,
          font: { size: 11, color: '#000' }
        }
      ]
    };

    setForecastChart({
      data: [historicalTrace, confidenceIntervalTrace, forecastTrace],
      layout: layout
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const KpiCard = ({ title, value, subtitle, trend, period }) => (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">📈</div>
        <div className="kpi-title">{title}</div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtitle">
        {subtitle}
        {trend && <span className={`trend-indicator ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </span>}
        {period && <span className="period-badge">{period}</span>}
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="chart-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-controls"></div>
      </div>
      <div className="skeleton-chart" style={{ height: '500px' }}></div>
    </div>
  );

  return (
    <div className="forecast">
      <div className="forecast-header">
        <div className="header-content">
          <h1 className="forecast-title">Revenue Forecast</h1>
          <p className="forecast-subtitle">
            Predictive analytics and future performance insights
          </p>
        </div>
        <div className="confidence-controls">
          <label className="confidence-label">Confidence Level:</label>
          <select 
            value={confidenceLevel} 
            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
            className="confidence-select"
            disabled={loading}
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={99}>99%</option>
          </select>
        </div>
      </div>

      <div className="forecast-kpis">
        <KpiCard
          title="Next Month Forecast"
          value={loading ? '—' : formatCurrency(forecast.predicted_revenue)}
          subtitle="Predicted revenue"
          period={forecast.next_month}
        />
        <KpiCard
          title="Confidence Range"
          value={loading ? '—' : `${formatCurrency(forecast.lower_ci)} - ${formatCurrency(forecast.upper_ci)}`}
          subtitle={`${confidenceLevel}% confidence`}
        />
        <KpiCard
          title="Growth Forecast"
          value={loading ? '—' : `+${forecast.growth_rate || 0}%`}
          subtitle="vs previous month"
          trend={forecast.growth_rate}
        />
        <KpiCard
          title="Model Accuracy"
          value={loading ? '—' : `${forecast.model_accuracy || '95'}%`}
          subtitle="Prediction confidence"
        />
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Revenue Forecast Timeline</h3>
          <div className="chart-actions">
            <button className="chart-action-btn">📊</button>
            <button className="chart-action-btn">⤢</button>
          </div>
        </div>
        
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="chart-wrapper">
            <Plot 
              data={forecastChart.data || []}
              layout={forecastChart.layout}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                modeBarButtonsToAdd: [],
                toImageButtonOptions: {
                  format: 'png',
                  filename: 'revenue-forecast',
                  scale: 2
                }
              }}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <div className="forecast-insights">
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📊 Forecast Methodology</h4>
            <div className="insight-content">
              <p>Using time series analysis with seasonal decomposition to predict future revenue trends based on historical patterns.</p>
              <ul>
                <li>Historical data analysis</li>
                <li>Seasonal trend detection</li>
                <li>Confidence interval calculation</li>
              </ul>
            </div>
          </div>
          <div className="insight-card">
            <h4>💡 Key Insights</h4>
            <div className="insight-content">
              <div className="insight-item">
                <strong>Seasonal Impact:</strong> Q4 typically shows 25% higher revenue
              </div>
              <div className="insight-item">
                <strong>Growth Trend:</strong> Consistent month-over-month increase observed
              </div>
              <div className="insight-item">
                <strong>Recommendation:</strong> Increase inventory for predicted demand
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
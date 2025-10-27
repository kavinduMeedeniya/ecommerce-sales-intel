import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { api } from '../services/api';

const Insights = ({ filters }) => {
  const [linesChart, setLinesChart] = useState({});
  const [countryChart, setCountryChart] = useState({});
  const [loading, setLoading] = useState({ lines: true, country: true });
  const [activeTab, setActiveTab] = useState('product');

  useEffect(() => {
    setLoading({ lines: true, country: true });
    
    Promise.all([
      api.get('/top-product-lines'),
      api.get('/revenue-by-country')
    ]).then(([linesRes, countryRes]) => {
      setLinesChart(JSON.parse(linesRes.data.chart));
      setCountryChart(JSON.parse(countryRes.data.chart));
      setLoading({ lines: false, country: false });
    }).catch(() => {
      setLoading({ lines: false, country: false });
    });
  }, [filters]);

  const chartLayout = {
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
      font: { color: 'white', size: 11 }
    },
    xaxis: {
      gridcolor: '#f0f0f0',
      linecolor: '#000',
      linewidth: 1,
      tickfont: { color: '#666', size: 10 },
      title: { font: { size: 12, color: '#333', weight: 'bold' } }
    },
    yaxis: {
      gridcolor: '#f0f0f0',
      linecolor: '#000',
      linewidth: 1,
      tickfont: { color: '#666', size: 10 },
      title: { font: { size: 12, color: '#333', weight: 'bold' } }
    }
  };

  const StatCard = ({ title, value, change, description, icon }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-title">{title}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className="stat-change">
          <span className={`change-indicator ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
          </span>
          <span className="change-label">vs last period</span>
        </div>
      )}
      {description && <div className="stat-description">{description}</div>}
    </div>
  );

  const ChartSkeleton = ({ title, height = 400 }) => (
    <div className="chart-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-controls"></div>
      </div>
      <div className="skeleton-chart" style={{ height: `${height}px` }}></div>
    </div>
  );

  const TabButton = ({ active, onClick, children, icon }) => (
    <button 
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="tab-icon">{icon}</span>
      {children}
    </button>
  );

  return (
    <div className="insights">
      <div className="insights-header">
        <div className="header-content">
          <h1 className="insights-title">Business Insights</h1>
          <p className="insights-subtitle">
            Deep dive into product performance and geographic distribution
            {Object.keys(filters).some(key => filters[key]) && (
              <span className="filters-badge">Filters Applied</span>
            )}
          </p>
        </div>
        <div className="insights-tabs">
          <TabButton 
            active={activeTab === 'product'} 
            onClick={() => setActiveTab('product')}
            icon="📦"
          >
            Product Analysis
          </TabButton>
          <TabButton 
            active={activeTab === 'geography'} 
            onClick={() => setActiveTab('geography')}
            icon="🌍"
          >
            Geographic Insights
          </TabButton>
          <TabButton 
            active={activeTab === 'performance'} 
            onClick={() => setActiveTab('performance')}
            icon="🚀"
          >
            Performance Metrics
          </TabButton>
        </div>
      </div>

      <div className="insights-stats">
        <StatCard
          title="Top Product Line"
          value={linesChart?.top_product || "—"}
          change={12.5}
          description="Highest revenue generator"
          icon="⭐"
        />
        <StatCard
          title="Top Country"
          value={countryChart?.top_country || "—"}
          change={8.3}
          description="Leading market by revenue"
          icon="🏆"
        />
        <StatCard
          title="Market Coverage"
          value={countryChart?.total_countries ? `${countryChart.total_countries} countries` : "—"}
          description="Global presence"
          icon="🌐"
        />
        <StatCard
          title="Product Diversity"
          value={linesChart?.total_lines ? `${linesChart.total_lines} lines` : "—"}
          change={5.2}
          description="Product portfolio size"
          icon="📊"
        />
      </div>

      {activeTab === 'product' && (
        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Top Product Lines by Revenue</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">📊</button>
                  <button className="chart-action-btn">⤢</button>
                </div>
              </div>
              {loading.lines ? (
                <ChartSkeleton title="Product Lines Revenue" height={450} />
              ) : (
                <div className="chart-wrapper">
                  <Plot 
                    data={linesChart.data ? linesChart.data.map(trace => ({
                      ...trace,
                      marker: {
                        ...trace.marker,
                        line: { width: 1, color: '#000' }
                      }
                    })) : []}
                    layout={{
                      ...chartLayout,
                      ...linesChart.layout,
                      title: { text: '', font: { size: 16, color: '#000', weight: 'bold' } },
                      height: 450,
                      showlegend: false,
                      barmode: 'group',
                      yaxis: {
                        ...chartLayout.yaxis,
                        tickformat: '$,.0f'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                      toImageButtonOptions: {
                        format: 'png',
                        filename: 'top-product-lines',
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
                    <span className="stat-label">Total Product Lines</span>
                    <span className="stat-value">{linesChart.total_lines || '—'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Revenue Share</span>
                    <span className="stat-value">{linesChart.top_share || '—'}% by top line</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="insights-sidebar">
              <div className="insight-card">
                <h4>💡 Product Insights</h4>
                <div className="insight-list">
                  <div className="insight-item">
                    <div className="insight-icon">🎯</div>
                    <div className="insight-content">
                      <strong>Best Performer:</strong> {linesChart.top_product || 'Classic Cars'}
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <strong>Growth Leader:</strong> Vintage Cars (+15% MoM)
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">💡</div>
                    <div className="insight-content">
                      <strong>Opportunity:</strong> Expand motorcycle line in emerging markets
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🔄</div>
                    <div className="insight-content">
                      <strong>Recommendation:</strong> Increase inventory for top 3 product lines
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geography' && (
        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Revenue Distribution by Country</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">📊</button>
                  <button className="chart-action-btn">⤢</button>
                </div>
              </div>
              {loading.country ? (
                <ChartSkeleton title="Revenue by Country" height={500} />
              ) : (
                <div className="chart-wrapper">
                  <Plot 
                    data={countryChart.data ? countryChart.data.map(trace => ({
                      ...trace,
                      marker: {
                        ...trace.marker,
                        line: { width: 1, color: '#000' }
                      }
                    })) : []}
                    layout={{
                      ...chartLayout,
                      ...countryChart.layout,
                      title: { text: '', font: { size: 16, color: '#000', weight: 'bold' } },
                      height: 500,
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        bordercolor: '#e0e0e0',
                        borderwidth: 1,
                        font: { size: 11, color: '#666' }
                      },
                      yaxis: {
                        ...chartLayout.yaxis,
                        tickformat: '$,.0f'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                      toImageButtonOptions: {
                        format: 'png',
                        filename: 'revenue-by-country',
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
                    <span className="stat-label">Top Market</span>
                    <span className="stat-value">{countryChart.top_country || '—'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Market Share</span>
                    <span className="stat-value">{countryChart.top_share || '—'}% by top country</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="insights-sidebar">
              <div className="insight-card">
                <h4>🌍 Geographic Insights</h4>
                <div className="insight-list">
                  <div className="insight-item">
                    <div className="insight-icon">🏆</div>
                    <div className="insight-content">
                      <strong>Leading Market:</strong> {countryChart.top_country || 'USA'}
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🚀</div>
                    <div className="insight-content">
                      <strong>Emerging Market:</strong> Australia (+22% growth)
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">💡</div>
                    <div className="insight-content">
                      <strong>Opportunity:</strong> Expand European distribution network
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🔄</div>
                    <div className="insight-content">
                      <strong>Recommendation:</strong> Localize marketing in top 5 markets
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="tab-content">
          <div className="performance-metrics">
            <div className="metric-grid">
              <div className="metric-card">
                <h4>Market Efficiency</h4>
                <div className="metric-value">84%</div>
                <div className="metric-description">Revenue per market coverage</div>
              </div>
              <div className="metric-card">
                <h4>Product Concentration</h4>
                <div className="metric-value">42%</div>
                <div className="metric-description">Top 3 products revenue share</div>
              </div>
              <div className="metric-card">
                <h4>Geographic Diversity</h4>
                <div className="metric-value">67%</div>
                <div className="metric-description">Revenue outside home market</div>
              </div>
              <div className="metric-card">
                <h4>Growth Stability</h4>
                <div className="metric-value">92%</div>
                <div className="metric-description">Consistent performance score</div>
              </div>
            </div>
            
            <div className="performance-insights">
              <h4>Strategic Recommendations</h4>
              <div className="recommendation-list">
                <div className="recommendation-item">
                  <div className="rec-icon">🎯</div>
                  <div className="rec-content">
                    <strong>Focus on High-Margin Products:</strong> Optimize inventory for top-performing product lines
                  </div>
                </div>
                <div className="recommendation-item">
                  <div className="rec-icon">🌍</div>
                  <div className="rec-content">
                    <strong>Expand Geographic Reach:</strong> Target underpenetrated European markets
                  </div>
                </div>
                <div className="recommendation-item">
                  <div className="rec-icon">📈</div>
                  <div className="rec-content">
                    <strong>Diversify Product Portfolio:</strong> Develop complementary product categories
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
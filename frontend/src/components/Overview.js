import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const Overview = ({ filters }) => {
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.post('/filtered-data', filters)
      .then(res => {
        setKpis(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  const KpiCard = ({ title, value, subtitle, icon, trend }) => (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-title">{title}</div>
      </div>
      <div className="kpi-value">
        {loading ? (
          <div className="loading-skeleton">—</div>
        ) : (
          value
        )}
      </div>
      {subtitle && (
        <div className="kpi-subtitle">
          {subtitle}
          {trend && <span className={`trend-indicator ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="overview">
      <div className="overview-header">
        <h1 className="overview-title">Performance Overview</h1>
        <div className="overview-subtitle">
          Real-time insights based on current filters
          {Object.keys(filters).some(key => filters[key]) && (
            <span className="filters-active">• Filters Active</span>
          )}
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpis.total_revenue)}
          subtitle="All-time revenue"
          icon="💰"
          trend={kpis.revenue_growth}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(kpis.total_orders)}
          subtitle="Completed orders"
          icon="📦"
          trend={kpis.orders_growth}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(kpis.avg_order_value)}
          subtitle="Per transaction"
          icon="📊"
          trend={kpis.aov_growth}
        />
        <KpiCard
          title="Top Product"
          value={kpis.top_product || "—"}
          subtitle="Best performing"
          icon="⭐"
        />
      </div>

      <div className="overview-content">
        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <h3>Quick Insights</h3>
              <span className="card-badge">Live</span>
            </div>
            <div className="insights-list">
              {loading ? (
                Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="insight-item loading">
                    <div className="insight-skeleton"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="insight-item">
                    <div className="insight-icon">🎯</div>
                    <div className="insight-text">
                      <strong>Peak Performance:</strong> {kpis.peak_month || 'December'}
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🌍</div>
                    <div className="insight-text">
                      <strong>Top Market:</strong> {kpis.top_country || 'USA'}
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🚀</div>
                    <div className="insight-text">
                      <strong>Growth Rate:</strong> {kpis.overall_growth || '15%'} this period
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="activity-list">
              {loading ? (
                Array(2).fill(0).map((_, idx) => (
                  <div key={idx} className="activity-item loading">
                    <div className="activity-skeleton"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <div className="activity-title">Data Updated</div>
                      <div className="activity-time">Just now</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <div className="activity-title">Filters Applied</div>
                      <div className="activity-time">
                        {Object.keys(filters).filter(key => filters[key]).length} active
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
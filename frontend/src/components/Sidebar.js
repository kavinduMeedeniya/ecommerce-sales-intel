import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ filters, setFilters }) => {
  const location = useLocation();

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/trends', label: 'Sales Trends'},
    { path: '/forecast', label: 'Forecast'},
    { path: '/insights', label: 'Insights'}
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Analytics</h1>
        <div className="sidebar-subtitle">Sales Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        <h3 className="nav-section-title">Navigation</h3>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActiveLink(item.path) ? 'nav-link-active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActiveLink(item.path) && <div className="active-indicator" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="filters-section">
        <div className="filters-header">
          <h3 className="filters-title">Filters</h3>
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
            disabled={!Object.keys(filters).some(key => filters[key])}
          >
            Clear
          </button>
        </div>
        
        <div className="filters-group">
          <div className="filter-field">
            <label className="filter-label">Date Range</label>
            <div className="date-inputs">
              <input 
                type="date" 
                name="date_start" 
                value={filters.date_start || ''} 
                onChange={handleFilterChange} 
                className="filter-input" 
              />
              <span className="date-separator">to</span>
              <input 
                type="date" 
                name="date_end" 
                value={filters.date_end || ''} 
                onChange={handleFilterChange} 
                className="filter-input" 
              />
            </div>
          </div>

          <div className="filter-field">
            <label className="filter-label">Product Line</label>
            <input 
              type="text" 
              name="product_line" 
              value={filters.product_line || ''} 
              placeholder="Enter product line..." 
              onChange={handleFilterChange} 
              className="filter-input" 
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Country</label>
            <input 
              type="text" 
              name="country" 
              value={filters.country || ''} 
              placeholder="Enter country..." 
              onChange={handleFilterChange} 
              className="filter-input" 
            />
          </div>
        </div>

        <div className="active-filters">
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <div key={key} className="active-filter-tag">
                <span className="filter-tag-text">
                  {key.replace('_', ' ')}: {value}
                </span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                  className="filter-tag-remove"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
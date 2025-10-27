import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import SalesTrends from './components/SalesTrends';
import Forecast from './components/Forecast';
import Insights from './components/Insights';
import Chatbot from './components/Chatbot';
import './App.css';  // Add styles if needed

function App() {
  const [filters, setFilters] = useState({ date_start: '', date_end: '', product_line: '', country: '' });

  return (
  <Router>
    <div className="app">
      <Sidebar filters={filters} setFilters={setFilters} />  {/* Must include filters={filters} */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Overview filters={filters} />} />
          <Route path="/trends" element={<SalesTrends filters={filters} />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/insights" element={<Insights filters={filters} />} />
        </Routes>
        <Chatbot />
      </div>
    </div>
  </Router>
);
}

export default App;
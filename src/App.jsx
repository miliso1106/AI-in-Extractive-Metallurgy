import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProcessAnalyzer from './pages/ProcessAnalyzer';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import RecoveryPrediction from './pages/RecoveryPrediction';
import ProcessDataPage from './pages/ProcessDataPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'analyzer':
        return <ProcessAnalyzer />;
      case 'environmental':
        return <EnvironmentalImpact />;
      case 'recovery':
        return <RecoveryPrediction />;
      case 'data':
        return <ProcessDataPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-container min-h-screen">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

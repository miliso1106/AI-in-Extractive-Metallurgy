import React, { Suspense, lazy, useState } from 'react';
import Header from './components/Header';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProcessAnalyzer = lazy(() => import('./pages/ProcessAnalyzer'));
const EnvironmentalImpact = lazy(() => import('./pages/EnvironmentalImpact'));
const RecoveryPrediction = lazy(() => import('./pages/RecoveryPrediction'));
const ProcessDataPage = lazy(() => import('./pages/ProcessDataPage'));
const MLPrediction = lazy(() => import('./pages/MLPrediction'));

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
      case 'ml':
        return <MLPrediction />;
      case 'data':
        return <ProcessDataPage />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="dashboard-container min-h-screen">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="p-4 md:p-8">
        <Suspense fallback={<div className="text-slate-300">Loading page...</div>}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;

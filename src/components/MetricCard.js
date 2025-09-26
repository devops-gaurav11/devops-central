import React from 'react';

const MetricCard = ({ label, value, color }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20" data-testid="metric-card">
      <div className="text-center">
        <div className={`text-3xl font-bold ${color} mb-2`} data-testid="metric-value">
          {value}
        </div>
        <div className="text-gray-300 text-sm" data-testid="metric-label">{label}</div>
      </div>
    </div>
  );
};

export default MetricCard;
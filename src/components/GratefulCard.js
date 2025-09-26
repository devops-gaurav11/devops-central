import React from 'react';
import { CheckCircle } from 'lucide-react';

const GratefulCard = ({ icon, title, description }) => {
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
      data-testid="grateful-card"
    >
      <div className="text-blue-400 mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-white mb-3" data-testid="card-title">{title}</h4>
      <p className="text-gray-300 leading-relaxed" data-testid="card-description">{description}</p>
      <div className="mt-4 flex items-center text-green-400">
        <CheckCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">Active & Optimized</span>
      </div>
    </div>
  );
};

export default GratefulCard;
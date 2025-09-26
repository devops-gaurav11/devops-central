import React, { useState, useEffect } from 'react';
import { Server, GitBranch, Shield, Zap, Users, Heart, CheckCircle, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import GratefulCard from './GratefulCard';

const DevOpsHomepage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deploymentCount, setDeploymentCount] = useState(1247);
  const [uptime, setUptime] = useState(99.9);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const deploymentTimer = setInterval(() => {
      setDeploymentCount(prev => prev + Math.floor(Math.random() * 3));
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(deploymentTimer);
    };
  }, []);

  const gratefulItems = [
    {
      icon: <Server className="w-8 h-8" />,
      title: "Reliable Infrastructure",
      description: "Grateful for robust systems that keep our applications running smoothly 24/7"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Version Control",
      description: "Thankful for Git and collaborative development that enables seamless teamwork"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security First",
      description: "Appreciating the security measures that protect our users and data"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "CI/CD Pipelines",
      description: "Grateful for automation that delivers quality software faster than ever"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "DevOps Culture",
      description: "Thankful for the collaboration between development and operations teams"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Continuous Improvement",
      description: "Appreciating the journey of constant learning and optimization"
    }
  ];

  const metrics = [
    { label: "Deployments Today", value: deploymentCount, color: "text-green-600" },
    { label: "System Uptime", value: `${uptime}%`, color: "text-blue-600" },
    { label: "Pipeline Success", value: "98.5%", color: "text-purple-600" },
    { label: "Team Happiness", value: "❤️ 100%", color: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10" data-testid="header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">DevOps Central</h1>
            </div>
            <div className="text-sm text-gray-300" data-testid="current-time">
              {currentTime.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center" data-testid="hero-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Grateful for DevOps Excellence
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Celebrating the tools, practices, and people that make modern software delivery possible. 
            From infrastructure automation to continuous deployment, we're thankful for the DevOps journey.
          </p>
          <div className="flex items-center justify-center space-x-4 text-lg text-purple-300">
            <Heart className="w-6 h-6 text-red-400" />
            <span>Built with appreciation for the DevOps community</span>
            <Heart className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="container mx-auto px-6 py-12" data-testid="metrics-section">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index} 
              label={metric.label} 
              value={metric.value} 
              color={metric.color} 
            />
          ))}
        </div>
      </section>

      {/* Grateful Items */}
      <section className="container mx-auto px-6 py-12" data-testid="grateful-section">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          What We're Grateful For
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gratefulItems.map((item, index) => (
            <GratefulCard 
              key={index} 
              icon={item.icon} 
              title={item.title} 
              description={item.description} 
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-16 text-center" data-testid="cta-section">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-6">
            Join Our DevOps Journey
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Experience the power of gratitude-driven development. Build, deploy, and scale with appreciation for the tools and teams that make it all possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              data-testid="primary-cta"
            >
              Explore Our Pipeline
            </button>
            <button 
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/30 transition-all duration-300"
              data-testid="secondary-cta"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-8" data-testid="footer">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 DevOps Central. Built with ❤️ and React. Grateful for every deployment.
          </p>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <div className="flex items-center text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevOpsHomepage;
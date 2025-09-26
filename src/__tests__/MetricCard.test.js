import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricCard from '../components/MetricCard';

describe('MetricCard', () => {
  test('renders metric card with correct props', () => {
    const props = {
      label: 'Test Metric',
      value: '99.9%',
      color: 'text-green-600'
    };
    
    render(<MetricCard {...props} />);
    
    expect(screen.getByTestId('metric-label')).toHaveTextContent('Test Metric');
    expect(screen.getByTestId('metric-value')).toHaveTextContent('99.9%');
    expect(screen.getByTestId('metric-value')).toHaveClass('text-green-600');
  });

  test('renders with different colors', () => {
    const props = {
      label: 'Blue Metric',
      value: '100',
      color: 'text-blue-500'
    };
    
    render(<MetricCard {...props} />);
    
    expect(screen.getByTestId('metric-value')).toHaveClass('text-blue-500');
  });
});
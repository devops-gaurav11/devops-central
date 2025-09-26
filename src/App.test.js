import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the DevOpsHomepage component
jest.mock('./components/DevOpsHomepage', () => {
  return function MockedDevOpsHomepage() {
    return <div data-testid="devops-homepage">DevOps Homepage Component</div>;
  };
});

describe('App', () => {
  test('renders DevOpsHomepage component', () => {
    render(<App />);
    expect(screen.getByTestId('devops-homepage')).toBeInTheDocument();
  });
});
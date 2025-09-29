import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Jenkins services used by the component
jest.mock('../services/jenkins', () => ({
  getMetrics: jest.fn().mockResolvedValue({ deploymentsToday: 1247, pipelineSuccess: 99, uptime: 99 }),
  getFolderJobCount: jest.fn().mockResolvedValue({ total: 10 })
}));

import DevOpsHomepage from '../components/DevOpsHomepage';
import { getMetrics } from '../services/jenkins';

// Mock lucide-react icons to avoid rendering issues in tests
jest.mock('lucide-react', () => ({
  Server: () => <div data-testid="server-icon">Server</div>,
  GitBranch: () => <div data-testid="gitbranch-icon">GitBranch</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  CheckCircle: () => <div data-testid="checkcircle-icon">CheckCircle</div>,
  TrendingUp: () => <div data-testid="trendingup-icon">TrendingUp</div>,
}));

describe('DevOpsHomepage', () => {
  test('renders main title', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByText('DevOps Central')).toBeInTheDocument();
  });

  test('renders hero section with gratitude message', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByText('Grateful for DevOps Excellence')).toBeInTheDocument();
    expect(screen.getByText(/Celebrating the tools, practices, and people/)).toBeInTheDocument();
  });

  test('displays current time', () => {
    render(<DevOpsHomepage />);
    const timeElement = screen.getByTestId('current-time');
    expect(timeElement).toBeInTheDocument();
  });

  test('renders all metric cards', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByText('Deployments Today')).toBeInTheDocument();
    expect(screen.getByText('System Uptime')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Success')).toBeInTheDocument();
    expect(screen.getByText('Jobs in Folder')).toBeInTheDocument();
  });

  test('renders all grateful items', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByText('Reliable Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Version Control')).toBeInTheDocument();
    expect(screen.getByText('Security First')).toBeInTheDocument();
    expect(screen.getByText('CI/CD Pipelines')).toBeInTheDocument();
    expect(screen.getByText('DevOps Culture')).toBeInTheDocument();
    expect(screen.getByText('Continuous Improvement')).toBeInTheDocument();
  });

  test('renders call-to-action buttons', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByTestId('primary-cta')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-cta')).toBeInTheDocument();
  });

  test('renders footer with copyright', () => {
    render(<DevOpsHomepage />);
    expect(screen.getByText(/© 2025 DevOps Central/)).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });

  test('deployment counter increments over time', async () => {
    jest.useFakeTimers();

    // First refresh returns 1247, second refresh (after 30s poll) returns 1248
    getMetrics
      .mockResolvedValueOnce({ deploymentsToday: 1247, pipelineSuccess: 99, uptime: 99 })
      .mockResolvedValueOnce({ deploymentsToday: 1248, pipelineSuccess: 99, uptime: 99 });

    render(<DevOpsHomepage />);

    // Wait for the first refresh to paint 1247
    await waitFor(() => expect(screen.getByText(/1247/)).toBeInTheDocument());

    // Advance to the next polling interval (30s) to trigger another refresh
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    // Wait for the updated value 1248 to appear
    await waitFor(() => expect(screen.getByText(/1248/)).toBeInTheDocument());

    jest.useRealTimers();
  });
});
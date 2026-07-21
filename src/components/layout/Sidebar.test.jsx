import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import { adminUser, internUser, renderWithProviders } from '../../test/testUtils';

describe('Sidebar', () => {
  it('shows only links allowed by the current management permissions', async () => {
    const limitedSupervisor = {
      ...adminUser,
      roles: ['supervisor'],
      permissions: ['dashboard.view', 'tasks.view'],
    };

    renderWithProviders(<Sidebar />, { withAuth: true, user: limitedSupervisor });

    expect(await screen.findByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all tasks/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /all users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create project/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create task/i })).not.toBeInTheDocument();
  });

  it('hides management navigation for non-management users', async () => {
    renderWithProviders(<Sidebar />, { withAuth: true, user: { ...internUser, permissions: adminUser.permissions } });

    expect(await screen.findByText(/management/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tasks/i })).not.toBeInTheDocument();
  });
});

import { expect, test } from '@playwright/test';

test.describe('Autenticacao', () => {
  const corsHeaders = {
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-origin': 'http://127.0.0.1:4200'
  };
  const session = {
    user: {
      id: 'user_e2e_1',
      companyId: 'company_e2e_1',
      name: 'Ana Admin',
      email: 'ana@trinus.test',
      role: 'ADMIN',
      isActive: true
    },
    company: {
      id: 'company_e2e_1',
      name: 'Atelie E2E'
    }
  };

  test('cria conta, acessa rota protegida e encerra sessao', async ({ page }) => {
    let isAuthenticated = false;

    await page.route('**/auth/session', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        status: isAuthenticated ? 200 : 401,
        body: isAuthenticated ? JSON.stringify(session) : JSON.stringify({ message: 'Authentication required.' })
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        status: 401,
        body: JSON.stringify({ message: 'Authentication required.' })
      });
    });
    await page.route('**/auth/register', async (route) => {
      isAuthenticated = true;
      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(session)
      });
    });
    await page.route('**/auth/logout', async (route) => {
      isAuthenticated = false;
      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ ok: true })
      });
    });
    await page.route('**/orders', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify([])
      });
    });

    await page.goto('/criar-conta');
    await page.getByLabel('Nome da empresa').fill('Atelie E2E');
    await page.getByLabel('Nome do administrador').fill('Ana Admin');
    await page.getByLabel('E-mail').fill('ana@trinus.test');
    await page.getByLabel('Senha').fill('secret123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Atelie E2E - Administrador')).toBeVisible();

    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Entrar no Trinus' }).first()).toBeVisible();
  });
});

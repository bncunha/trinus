import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';

type AccountData = {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
};

const API_URL = 'http://localhost:3001';
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function email(local: string): string {
  return `${local}.${runId}@e2e.trinus.test`;
}

function account(label: string): AccountData {
  return {
    companyName: `Empresa ${label} ${runId}`,
    adminName: `Admin ${label}`,
    email: email(`admin.${label.toLowerCase()}`),
    password: 'secret123'
  };
}

async function registerByUi(page: Page, input: AccountData): Promise<void> {
  await page.goto('/criar-conta');
  await page.getByLabel('Nome da empresa').fill(input.companyName);
  await page.getByLabel('Nome do administrador').fill(input.adminName);
  await page.getByLabel('E-mail').fill(input.email);
  await page.getByLabel('Senha').fill(input.password);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText(`${input.companyName} - Administrador`)).toBeVisible();
}

async function loginByUi(page: Page, emailAddress: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(emailAddress);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

async function logoutByUi(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function registerByApi(input: AccountData): Promise<APIRequestContext> {
  const context = await request.newContext({
    baseURL: API_URL
  });
  const response = await context.post('/auth/register', {
    data: {
      companyName: input.companyName,
      name: input.adminName,
      email: input.email,
      password: input.password
    }
  });

  expect(response.ok()).toBeTruthy();

  return context;
}

test.describe.serial('Fase 0 - fundacao multiempresa real', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((apiUrl) => {
      (window as Window & { __TRINUS_API_URL__?: string }).__TRINUS_API_URL__ = apiUrl;
    }, API_URL);
  });

  test('redireciona visitante anonimo de rota protegida para login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Entrar no Trinus' }).first()).toBeVisible();
  });

  test('cria empresa e primeiro administrador com sessao em cookies HTTP-only', async ({ page, context }) => {
    const input = account('Registro');

    await registerByUi(page, input);

    const cookies = await context.cookies(API_URL);
    const authCookie = cookies.find((cookie) => cookie.name === 'trinus_auth_e2e');
    const refreshCookie = cookies.find((cookie) => cookie.name === 'trinus_refresh_e2e');

    expect(authCookie?.httpOnly).toBe(true);
    expect(refreshCookie?.httpOnly).toBe(true);

    await context.clearCookies({ name: 'trinus_auth_e2e' });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`${input.companyName} - Administrador`)).toBeVisible();

    await logoutByUi(page);

    await loginByUi(page, input.email, input.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`${input.companyName} - Administrador`)).toBeVisible();
  });

  test('administrador cria usuarios e usuario gestor nao acessa administracao', async ({ page }) => {
    const input = account('Usuarios');
    const managerEmail = email('gestor.usuarios');
    const operatorEmail = email('operador.usuarios');

    await registerByUi(page, input);
    await page.getByRole('link', { name: /Usu.rios/ }).click();

    await expect(page).toHaveURL(/\/usuarios$/);
    await expect(page.getByRole('heading', { name: /Usu.rios/ })).toBeVisible();
    await expect(page.getByText(input.email)).toBeVisible();

    await page.getByRole('button', { name: /Novo usu.rio/ }).click();
    await page.locator('.users-page__drawer').getByLabel('Nome').fill('Gestor E2E');
    await page.locator('.users-page__drawer').getByLabel('E-mail').fill(managerEmail);
    await page.locator('.users-page__drawer').getByLabel('Papel').selectOption('MANAGER');
    await page.locator('.users-page__drawer').getByLabel('Senha inicial').fill('secret123');
    await page.getByRole('button', { name: /Criar usu.rio/ }).click();

    await expect(page.getByText(/Usu.rio criado com sucesso./)).toBeVisible();
    await expect(page.getByText(managerEmail)).toBeVisible();
    await expect(page.getByLabel(/Usu.rios filtrados/).getByText('Gestor', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Novo usu.rio/ }).click();
    await page.locator('.users-page__drawer').getByLabel('Nome').fill('Operador E2E');
    await page.locator('.users-page__drawer').getByLabel('E-mail').fill(operatorEmail);
    await page.locator('.users-page__drawer').getByLabel('Papel').selectOption('OPERATOR');
    await page.locator('.users-page__drawer').getByLabel('Senha inicial').fill('secret123');
    await page.getByRole('button', { name: /Criar usu.rio/ }).click();

    await expect(page.getByText(/Usu.rio criado com sucesso./)).toBeVisible();
    await expect(page.getByText(operatorEmail)).toBeVisible();
    await expect(page.getByLabel(/Usu.rios filtrados/).getByText('Operador', { exact: true })).toBeVisible();

    await logoutByUi(page);
    await loginByUi(page, managerEmail, 'secret123');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`${input.companyName} - Gestor`)).toBeVisible();
    await expect(page.getByRole('link', { name: /Usu.rios/ })).toHaveCount(0);

    const forbiddenResponse = await page.request.get(`${API_URL}/users`);
    expect(forbiddenResponse.status()).toBe(403);

    await logoutByUi(page);
    await loginByUi(page, operatorEmail, 'secret123');

    await expect(page).toHaveURL(/\/minha-execucao$/);
    await expect(page.getByText(`${input.companyName} - Operador`)).toBeVisible();
    await expect(page.getByRole('link', { name: /Usu.rios/ })).toHaveCount(0);
  });

  test('isola usuarios por empresa no backend real', async () => {
    const companyA = account('IsoladaA');
    const companyB = account('IsoladaB');
    const userAEmail = email('usuario.empresa.a');
    const userBEmail = email('usuario.empresa.b');

    const contextA = await registerByApi(companyA);
    const contextB = await registerByApi(companyB);

    const createA = await contextA.post('/users', {
      data: {
        name: 'Usuario Empresa A',
        email: userAEmail,
        role: 'MANAGER',
        password: 'secret123',
        isActive: true
      }
    });
    const createB = await contextB.post('/users', {
      data: {
        name: 'Usuario Empresa B',
        email: userBEmail,
        role: 'MANAGER',
        password: 'secret123',
        isActive: true
      }
    });

    expect(createA.ok()).toBeTruthy();
    expect(createB.ok()).toBeTruthy();

    const usersA = await (await contextA.get('/users')).json();
    const usersB = await (await contextB.get('/users')).json();

    expect(usersA.map((user: { email: string }) => user.email)).toContain(userAEmail);
    expect(usersA.map((user: { email: string }) => user.email)).not.toContain(userBEmail);
    expect(usersB.map((user: { email: string }) => user.email)).toContain(userBEmail);
    expect(usersB.map((user: { email: string }) => user.email)).not.toContain(userAEmail);

    await contextA.dispose();
    await contextB.dispose();
  });
});

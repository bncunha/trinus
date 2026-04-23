import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = 'http://localhost:3001';
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type AccountData = {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
};

async function setApiUrl(page: Page): Promise<void> {
  await page.addInitScript((apiUrl) => {
    (window as Window & { __TRINUS_API_URL__?: string }).__TRINUS_API_URL__ = apiUrl;
  }, API_URL);
}

function account(label: string): AccountData {
  return {
    companyName: `Empresa Pedido ${label} ${runId}`,
    adminName: `Admin Pedido ${label}`,
    email: `admin.pedido.${label.toLowerCase()}.${runId}@e2e.trinus.test`,
    password: 'secret123'
  };
}

async function registerCompany(page: Page, input = account('UI')): Promise<void> {
  await setApiUrl(page);
  await page.goto('/criar-conta');
  await page.getByLabel('Nome da empresa').fill(input.companyName);
  await page.getByLabel('Nome do administrador').fill(input.adminName);
  await page.getByLabel('E-mail').fill(input.email);
  await page.getByLabel('Senha').fill(input.password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function registerByApi(input: AccountData): Promise<APIRequestContext> {
  const context = await request.newContext({ baseURL: API_URL });
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

async function seedOperationalBase(context: APIRequestContext, label: string) {
  const customer = await (await context.post(`${API_URL}/master-data/customers`, { data: { name: `Cliente ${label}` } })).json();
  const product = await (
    await context.post(`${API_URL}/master-data/products`, {
      data: { name: `Camiseta ${label}`, costPrice: 15, salePrice: 39.9 }
    })
  ).json();
  const sector = await (await context.post(`${API_URL}/master-data/sectors`, { data: { name: `Corte ${label}` } })).json();
  const units = await (await context.get(`${API_URL}/master-data/measurement-units`)).json();
  const unit = units.find((item: { name: string }) => item.name === 'Peca') ?? units[0];
  const stage = await (
    await context.post(`${API_URL}/master-data/stages`, {
      data: { name: `Cortar ${label}`, sectorId: sector.id, measurementUnitId: unit.id, capacityPerWorkday: 80 }
    })
  ).json();
  const template = await (
    await context.post(`${API_URL}/master-data/templates`, {
      data: { name: `Fluxo ${label}`, items: [{ stageId: stage.id }] }
    })
  ).json();

  return { customer, product, stage, template };
}

async function selectSearchableOption(page: Page, label: string, option: string): Promise<void> {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('listbox', { name: label, exact: true }).getByRole('option', { name: option, exact: true }).click();
}

test.describe('Fase 2 - pedidos operacionais reais', () => {
  test('cria e edita pedido com cliente, produto e template aplicado', async ({ page }) => {
    await registerCompany(page);
    const seed = await seedOperationalBase(page.request, `UI ${runId}`);

    await page.goto('/pedidos/formulario');
    await selectSearchableOption(page, 'Cliente', `Cliente UI ${runId}`);
    await page.getByLabel('Código do pedido').fill(`PED-${runId}`);
    await page.getByLabel('Início').fill('2026-04-22');
    await page.getByLabel('Entrega prometida').fill('2026-04-30');
    await selectSearchableOption(page, 'Produto item 1', `Camiseta UI ${runId}`);
    await page.getByLabel('Quantidade').fill('42');
    await selectSearchableOption(page, 'Template item 1', `Fluxo UI ${runId}`);
    await page.getByRole('button', { name: 'Aplicar template' }).click();
    await expect(page.getByText(`Cortar UI ${runId}`)).toBeVisible();
    await page.getByRole('button', { name: 'Salvar pedido' }).click();

    await expect(page).toHaveURL(/\/pedidos$/);
    await expect(page.getByText(`Pedido PED-${runId}`)).toBeVisible();
    await expect(page.getByText(`Cliente UI ${runId}`)).toBeVisible();

    await page.getByRole('link', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/pedidos\/formulario\//);
    await expect(page.getByLabel('Quantidade')).toHaveValue('42');
    await page.getByLabel('Quantidade').fill('48');
    await page.getByRole('button', { name: 'Salvar pedido' }).click();
    await expect(page).toHaveURL(/\/pedidos$/);

    const orders = await (await page.request.get(`${API_URL}/orders`)).json();
    const order = orders.find((item: { orderNumber: string }) => item.orderNumber === `PED-${runId}`);
    expect(order.customerId).toBe(seed.customer.id);
    expect(order.items[0].productId).toBe(seed.product.id);
    expect(order.items[0].templateId).toBe(seed.template.id);
    expect(order.items[0].stages[0].stageId).toBe(seed.stage.id);
    expect(order.items[0].quantity).toBe(48);
  });

  test('isola pedidos por empresa no backend real', async () => {
    const contextA = await registerByApi(account('A'));
    const contextB = await registerByApi(account('B'));
    const seedA = await seedOperationalBase(contextA, `A ${runId}`);
    const seedB = await seedOperationalBase(contextB, `B ${runId}`);

    const orderA = await (
      await contextA.post(`${API_URL}/orders`, {
        data: {
          orderNumber: `A-${runId}`,
          customerId: seedA.customer.id,
          items: [{ productId: seedA.product.id, quantityMode: 'SINGLE', quantity: 12, templateId: seedA.template.id }]
        }
      })
    ).json();
    const orderB = await (
      await contextB.post(`${API_URL}/orders`, {
        data: {
          orderNumber: `A-${runId}`,
          customerId: seedB.customer.id,
          items: [{ productId: seedB.product.id, quantityMode: 'SINGLE', quantity: 12, templateId: seedB.template.id }]
        }
      })
    ).json();

    expect(orderA.id).not.toBe(orderB.id);
    expect((await contextA.get(`${API_URL}/orders/${orderB.id}`)).status()).toBe(404);
    expect(
      (
        await contextA.post(`${API_URL}/orders`, {
          data: {
            orderNumber: `INV-${runId}`,
            customerId: seedB.customer.id,
            items: [{ productId: seedA.product.id, quantityMode: 'SINGLE', quantity: 10 }]
          }
        })
      ).status()
    ).toBe(400);

    const ordersA = await (await contextA.get(`${API_URL}/orders`)).json();
    const ordersB = await (await contextB.get(`${API_URL}/orders`)).json();
    expect(ordersA.map((order: { id: string }) => order.id)).toContain(orderA.id);
    expect(ordersA.map((order: { id: string }) => order.id)).not.toContain(orderB.id);
    expect(ordersB.map((order: { id: string }) => order.id)).toContain(orderB.id);

    await contextA.dispose();
    await contextB.dispose();
  });
});

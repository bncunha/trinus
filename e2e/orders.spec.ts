import { expect, test } from '@playwright/test';

test.describe('Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

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
    const authHeaders = {
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-origin': 'http://127.0.0.1:4200'
    };

    await page.route('**/auth/session', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: authHeaders });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        headers: authHeaders,
        body: JSON.stringify(session)
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        headers: authHeaders,
        body: JSON.stringify(session)
      });
    });
    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        headers: authHeaders,
        body: JSON.stringify({ ok: true })
      });
    });

    const orders = [
      {
        id: 'order_e2e_1',
        orderNumber: '1001',
        customerName: 'Ateliê Solaris',
        status: 'IN_PROGRESS',
        startDate: '2026-04-08',
        deliveryDate: '2026-04-18',
        riskLevel: 'LOW',
        riskReason: 'Pedido dentro da janela planejada.',
        nextStep: 'Confirmar detalhes de produção.',
        finalNotes: 'Separar envio por caixa.',
        products: [{ name: 'Camiseta básica premium', quantity: 120 }]
      },
      {
        id: 'order_e2e_2',
        orderNumber: '1002',
        customerName: 'Casa Lume',
        status: 'REGISTERED',
        startDate: '2026-04-09',
        deliveryDate: '2026-04-22',
        riskLevel: 'MEDIUM',
        riskReason: 'Costura está com carga acima do esperado.',
        nextStep: 'Revisar fila de produção.',
        finalNotes: '',
        products: [{ name: 'Moletom com capuz', quantity: 48 }]
      }
    ];

    await page.route('**/orders', async (route) => {
      const request = route.request();
      const corsHeaders = {
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
        'access-control-allow-origin': 'http://127.0.0.1:4200'
      };

      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: corsHeaders
        });
        return;
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        const createdOrder = {
          ...body,
          id: 'order_e2e_created',
          status: 'REGISTERED',
          riskLevel: 'LOW',
          riskReason: 'Pedido aguardando análise operacional.',
          nextStep: 'Confirmar detalhes do pedido.'
        };

        orders.push(createdOrder);

        await route.fulfill({
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(createdOrder)
        });
        return;
      }

      if (request.method() === 'PATCH') {
        const body = request.postDataJSON();
        const orderId = request.url().split('/').pop();
        const orderIndex = orders.findIndex((order) => order.id === orderId);
        const updatedOrder = {
          ...orders[orderIndex],
          ...body,
          id: orderId
        };

        orders[orderIndex] = updatedOrder;

        await route.fulfill({
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(updatedOrder)
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(orders)
      });
    });

    await page.route('**/orders/**', async (route) => {
      const request = route.request();
      const corsHeaders = {
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'GET,PATCH,OPTIONS',
        'access-control-allow-origin': 'http://127.0.0.1:4200'
      };

      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: corsHeaders
        });
        return;
      }

      const orderId = request.url().split('/').pop();
      const order = orders.find((item) => item.id === orderId);

      if (!order) {
        await route.fulfill({
          contentType: 'application/json',
          headers: corsHeaders,
          status: 404,
          body: JSON.stringify({ message: 'Order not found' })
        });
        return;
      }

      if (request.method() === 'PATCH') {
        const body = request.postDataJSON();
        const orderIndex = orders.findIndex((item) => item.id === orderId);
        const updatedOrder = {
          ...orders[orderIndex],
          ...body,
          id: orderId
        };

        orders[orderIndex] = updatedOrder;

        await route.fulfill({
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(updatedOrder)
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(order)
      });
    });
  });

  test('abre a lista, cria um pedido e volta para a lista com o registro salvo', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: /Pedidos/ }).click();

    await expect(page).toHaveURL(/\/pedidos\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard de pedidos', level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Ver lista' }).click();

    await expect(page).toHaveURL(/\/pedidos$/);
    await expect(page.getByRole('heading', { name: 'Pedidos', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Acompanhe os pedidos' })).toBeVisible();
    await expect(page.locator('.orders-app__item')).toHaveCount(2);
    await expect(page.locator('.orders-app__item')).toHaveText([/Casa Lume/, /Solaris/]);

    await page.getByRole('link', { name: 'Novo pedido' }).click();

    await expect(page.getByRole('heading', { name: 'Novo pedido', level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/pedidos\/formulario$/);

    await page.getByLabel(/Cliente/).fill('Loja Horizonte');
    await page.getByLabel(/Código do pedido/).fill('PED-E2E-2401');
    await page.getByLabel(/Início/).fill('2026-04-12');
    await page.getByLabel(/Entrega/).fill('2026-04-30');
    await page.getByLabel(/Item/).fill('Camiseta polo');
    await page.getByLabel(/Quantidade/).fill('80');
    await page.getByRole('button', { name: 'Adicionar item' }).click();
    await page.getByLabel(/Item/).nth(1).fill('Moletom');
    await page.getByLabel(/Quantidade/).nth(1).fill('12');
    await page.getByLabel(/Observações finais/).fill('Separar por tamanho.');

    await page.getByRole('button', { name: 'Salvar pedido' }).click();

    await expect(page.getByRole('status')).toContainText('Pedido salvo com sucesso.');
    await expect(page.getByRole('heading', { name: 'Pedidos', level: 1 })).toBeVisible();
    await expect(page.locator('.orders-app__item')).toHaveCount(3);
    await expect(page.locator('.orders-app__item').first()).toContainText('PED-E2E-2401');
    await expect(page.getByText('Loja Horizonte')).toBeVisible();

    await page.locator('.orders-app__item').first().getByRole('link', { name: 'Editar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar pedido', level: 1 })).toBeVisible();
    await page.getByLabel(/Cliente/).fill('Loja Horizonte Atualizada');
    await page.getByRole('button', { name: 'Salvar pedido' }).click();

    await expect(page.getByText('Loja Horizonte Atualizada')).toBeVisible();
  });

  test('abre o dashboard de pedidos com os últimos 5 pedidos e atalhos', async ({ page }) => {
    await page.goto('/pedidos/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard de pedidos', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ver lista/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Novo pedido/ })).toBeVisible();
    await expect(page.locator('.orders-app__quick-actions')).toBeVisible();
    await expect(page.locator('.orders-app__action-card')).toHaveCount(0);
    await expect(page.locator('.orders-app__list--compact .orders-app__item')).toHaveCount(2);
  });
});

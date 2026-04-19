import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = 'http://localhost:3001';
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type AccountData = {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
};

function account(label: string): AccountData {
  return {
    companyName: `Empresa ${label} ${runId}`,
    adminName: `Admin ${label}`,
    email: `admin.${label.toLowerCase()}.${runId}@e2e.trinus.test`,
    password: 'secret123'
  };
}

async function setApiUrl(page: Page): Promise<void> {
  await page.addInitScript((apiUrl) => {
    (window as Window & { __TRINUS_API_URL__?: string }).__TRINUS_API_URL__ = apiUrl;
  }, API_URL);
}

async function registerCompany(page: Page, input = account('Fase1')): Promise<AccountData> {
  await setApiUrl(page);
  await page.goto('/criar-conta');
  await page.getByLabel('Nome da empresa').fill(input.companyName);
  await page.getByLabel('Nome do administrador').fill(input.adminName);
  await page.getByLabel('E-mail').fill(input.email);
  await page.getByLabel('Senha').fill(input.password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  return input;
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

async function saveAndExpect(page: Page, visibleText: string | RegExp): Promise<void> {
  await page.getByRole('button', { name: 'Salvar cadastro' }).click();
  await expect(page.getByText('Cadastro salvo com sucesso.')).toBeVisible();
  await expect(page.getByText(visibleText, typeof visibleText === 'string' ? { exact: true } : undefined)).toBeVisible();
}

async function editRecord(page: Page, currentText: string, nextName: string): Promise<void> {
  const row = page.locator('.settings-crud__item').filter({ hasText: currentText });
  await row.getByRole('button', { name: 'Editar cadastro' }).click();
  await page.locator('.settings-crud__drawer').getByLabel('Nome').fill(nextName);
  await saveAndExpect(page, nextName);
}

async function filterRecord(page: Page, search: string, visibleText: string, hiddenText?: string): Promise<void> {
  await page.getByLabel('Busca').fill(search);
  await expect(page.getByText(visibleText, { exact: true })).toBeVisible();

  if (hiddenText) {
    await expect(page.getByText(hiddenText, { exact: true })).toHaveCount(0);
  }
}

async function deactivateRecord(page: Page, visibleText: string): Promise<void> {
  const row = page.locator('.settings-crud__item').filter({ hasText: visibleText });
  await row.getByRole('button', { name: 'Inativar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Inativar' }).click();
  await expect(page.getByText('Cadastro inativado com sucesso.')).toBeVisible();
  await expect(row.getByText('Inativo')).toBeVisible();
}

test.describe('Fase 1 - cadastros base reais', () => {
  test('configura unidades, variável, setor, etapa e template de produção', async ({ page }) => {
    await registerCompany(page);

    await page.getByRole('link', { name: /Configura/ }).click();
    await expect(page).toHaveURL(/\/configuracoes$/);
    await expect(page.getByRole('heading', { name: 'Cadastros base', level: 1 })).toBeVisible();
    await expect(page.getByText('Unidades de medida')).toBeVisible();
    await expect(page.getByText(/4 cadastrados/)).toBeVisible();

    await page.getByRole('link', { name: /Unidades de medida/ }).click();
    await expect(page).toHaveURL(/\/configuracoes\/unidades-medida$/);
    await expect(page.getByText('Metro')).toBeVisible();
    await expect(page.getByText('Kilo')).toBeVisible();

    await page.goto('/configuracoes/variaveis');
    await page.getByRole('button', { name: /Nova vari.vel/ }).first().click();
    await page.getByLabel('Nome').fill('Estampas');
    await page.getByLabel('Descrição opcional').fill('Quantidade de estampas por peça.');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Cadastro salvo com sucesso.')).toBeVisible();
    await expect(page.getByText('Estampas', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/setores');
    await page.getByRole('button', { name: /Novo setor/ }).first().click();
    await page.getByLabel('Nome').fill('Corte');
    await page.getByLabel('Descrição opcional').fill('Preparação e corte de peças.');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Cadastro salvo com sucesso.')).toBeVisible();
    await expect(page.getByText('Corte', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/etapas');
    await page.getByRole('button', { name: /Nova etapa/ }).first().click();
    await page.getByLabel('Nome').fill('Cortar tecido');
    await page.getByLabel('Setor').selectOption({ label: 'Corte' });
    await page.getByLabel('Unidade de medida').selectOption({ label: 'Metro (m)' });
    await page.getByRole('spinbutton', { name: /Capacidade/ }).fill('120');
    await page.getByLabel('Variável opcional').selectOption({ label: 'Estampas' });
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Cadastro salvo com sucesso.')).toBeVisible();
    await expect(page.getByText('Cortar tecido')).toBeVisible();
    await expect(page.getByText(/120 m\/dia/)).toBeVisible();

    await page.goto('/configuracoes/templates-producao');
    await page.getByRole('button', { name: /Novo template/ }).first().click();
    await page.getByLabel('Nome').fill('Camisa DTF');
    await page.getByLabel('Descrição opcional').fill('Fluxo inicial para camisa DTF.');
    await page.getByLabel('Etapa 1').selectOption({ label: 'Cortar tecido' });
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Cadastro salvo com sucesso.')).toBeVisible();
    await expect(page.getByText('Camisa DTF')).toBeVisible();
    await expect(page.getByText('1 etapas')).toBeVisible();
  });

  test('faz CRUD completo nas telas de cadastros base', async ({ page }) => {
    await registerCompany(page, account('CrudFase1'));

    await page.goto('/configuracoes/unidades-medida');
    await page.getByRole('button', { name: /Nova unidade/ }).first().click();
    await page.getByLabel('Nome').fill('Litro');
    await page.getByLabel('Sigla').fill('l');
    await saveAndExpect(page, 'Litro');
    await filterRecord(page, 'litro', 'Litro', 'Metro');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Litro', 'Litro revisado');
    await deactivateRecord(page, 'Litro revisado');

    await page.goto('/configuracoes/variaveis');
    await page.getByRole('button', { name: /Nova vari.vel/ }).first().click();
    await page.getByLabel('Nome').fill('Estampas CRUD');
    await page.getByLabel('Descrição opcional').fill('Quantidade por item.');
    await saveAndExpect(page, 'Estampas CRUD');
    await filterRecord(page, 'estampas', 'Estampas CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Estampas CRUD', 'Estampas revisadas');
    await deactivateRecord(page, 'Estampas revisadas');

    await page.goto('/configuracoes/setores');
    await page.getByRole('button', { name: /Novo setor/ }).first().click();
    await page.getByLabel('Nome').fill('Costura CRUD');
    await page.getByLabel('Descrição opcional').fill('Setor de costura.');
    await saveAndExpect(page, 'Costura CRUD');
    await filterRecord(page, 'costura', 'Costura CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Costura CRUD', 'Costura revisada');
    await deactivateRecord(page, 'Costura revisada');

    await page.goto('/configuracoes/setores');
    await page.getByRole('button', { name: /Novo setor/ }).first().click();
    await page.getByLabel('Nome').fill('Corte CRUD');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Corte CRUD', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/variaveis');
    await page.getByRole('button', { name: /Nova vari.vel/ }).first().click();
    await page.getByLabel('Nome').fill('Camadas CRUD');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Camadas CRUD', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/etapas');
    await page.getByRole('button', { name: /Nova etapa/ }).first().click();
    await expect(page.locator('select[formControlName="sectorId"] option', { hasText: 'Costura revisada' })).toHaveCount(0);
    await expect(page.locator('select[formControlName="measurementUnitId"] option', { hasText: 'Litro revisado' })).toHaveCount(0);
    await expect(page.locator('select[formControlName="variableId"] option', { hasText: 'Estampas revisadas' })).toHaveCount(0);
    await page.getByLabel('Nome').fill('Cortar CRUD');
    await page.getByLabel('Setor').selectOption({ label: 'Corte CRUD' });
    await page.getByLabel('Unidade de medida').selectOption({ label: 'Metro (m)' });
    await page.getByRole('spinbutton', { name: /Capacidade/ }).fill('90');
    await page.getByLabel('Variável opcional').selectOption({ label: 'Camadas CRUD' });
    await saveAndExpect(page, 'Cortar CRUD');
    await filterRecord(page, 'cortar', 'Cortar CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Cortar CRUD', 'Cortar revisado');
    await deactivateRecord(page, 'Cortar revisado');

    await page.goto('/configuracoes/etapas');
    await page.getByRole('button', { name: /Nova etapa/ }).first().click();
    await page.getByLabel('Nome').fill('Conferir CRUD');
    await page.getByLabel('Setor').selectOption({ label: 'Corte CRUD' });
    await page.getByLabel('Unidade de medida').selectOption({ label: 'Metro (m)' });
    await page.getByRole('spinbutton', { name: /Capacidade/ }).fill('45');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Conferir CRUD', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/etapas');
    await page.getByRole('button', { name: /Nova etapa/ }).first().click();
    await page.getByLabel('Nome').fill('Embalar CRUD');
    await page.getByLabel('Setor').selectOption({ label: 'Corte CRUD' });
    await page.getByLabel('Unidade de medida').selectOption({ label: 'Metro (m)' });
    await page.getByRole('spinbutton', { name: /Capacidade/ }).fill('30');
    await page.getByRole('button', { name: 'Salvar cadastro' }).click();
    await expect(page.getByText('Embalar CRUD', { exact: true })).toBeVisible();

    await page.goto('/configuracoes/templates-producao');
    await page.getByRole('button', { name: /Novo template/ }).first().click();
    await page.getByLabel('Nome').fill('Template CRUD');
    await expect(page.locator('select[formControlName="stageId"]').first().locator('option', { hasText: 'Cortar revisado' })).toHaveCount(0);
    await page.getByLabel('Etapa 1').selectOption({ label: 'Conferir CRUD' });
    await page.getByRole('button', { name: 'Adicionar etapa' }).click();
    await page.getByLabel('Etapa 2').selectOption({ label: 'Embalar CRUD' });
    await page.getByRole('button', { name: 'Subir item 2 do template' }).click();
    await saveAndExpect(page, 'Template CRUD');
    await filterRecord(page, 'template', 'Template CRUD');
    await page.getByLabel('Busca').fill('');
    await page.locator('.settings-crud__item').filter({ hasText: 'Template CRUD' }).getByRole('button', { name: 'Editar cadastro' }).click();
    await expect(page.getByLabel('Etapa 1').locator('option:checked')).toHaveText('Embalar CRUD');
    await page.locator('.settings-crud__drawer').getByLabel('Nome').fill('Template revisado');
    await saveAndExpect(page, 'Template revisado');
    await deactivateRecord(page, 'Template revisado');

    await page.goto('/configuracoes/tamanhos');
    await page.getByRole('button', { name: /Novo tamanho/ }).first().click();
    await page.getByLabel('Nome').fill('M CRUD');
    await saveAndExpect(page, 'M CRUD');
    await filterRecord(page, 'm crud', 'M CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'M CRUD', 'M revisado');
    await deactivateRecord(page, 'M revisado');

    await page.goto('/clientes');
    await page.getByRole('button', { name: /Novo cliente/ }).first().click();
    await page.getByLabel('Nome completo').fill('Cliente CRUD');
    await page.getByLabel('CPF opcional').fill('12345678901');
    await page.getByLabel('Celular opcional').fill('(11) 99999-0000');
    await saveAndExpect(page, 'Cliente CRUD');
    await filterRecord(page, 'cliente', 'Cliente CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Cliente CRUD', 'Cliente revisado');
    await deactivateRecord(page, 'Cliente revisado');

    await page.goto('/produtos');
    await page.getByRole('button', { name: /Novo produto/ }).first().click();
    await page.getByLabel('Nome').fill('Camiseta CRUD');
    await page.getByLabel('Custo do produto').fill('15.50');
    await page.getByLabel('Preco de venda').fill('39.90');
    await page.getByLabel('Variavel 1').selectOption({ label: 'Camadas CRUD' });
    await page.getByLabel('Valor padrao').fill('2');
    await saveAndExpect(page, 'Camiseta CRUD');
    await filterRecord(page, 'camiseta', 'Camiseta CRUD');
    await page.getByLabel('Busca').fill('');
    await editRecord(page, 'Camiseta CRUD', 'Camiseta revisada');
    await deactivateRecord(page, 'Camiseta revisada');
  });

  test('isola cadastros base por empresa e permite nomes iguais em empresas diferentes', async () => {
    const contextA = await registerByApi(account('MasterA'));
    const contextB = await registerByApi(account('MasterB'));

    const unitA = await (await contextA.post('/master-data/measurement-units', { data: { name: 'Galão', code: 'gal' } })).json();
    const unitB = await (await contextB.post('/master-data/measurement-units', { data: { name: 'Galão', code: 'gal' } })).json();
    expect(unitA.id).not.toBe(unitB.id);
    expect((await contextA.post('/master-data/measurement-units', { data: { name: 'Galão', code: 'gal2' } })).status()).toBe(409);

    const variableA = await (await contextA.post('/master-data/variables', { data: { name: 'Camadas' } })).json();
    const variableB = await (await contextB.post('/master-data/variables', { data: { name: 'Camadas' } })).json();
    expect(variableA.id).not.toBe(variableB.id);
    expect((await contextA.post('/master-data/variables', { data: { name: 'Camadas' } })).status()).toBe(409);

    const sectorA = await (await contextA.post('/master-data/sectors', { data: { name: 'Acabamento' } })).json();
    const sectorB = await (await contextB.post('/master-data/sectors', { data: { name: 'Acabamento' } })).json();
    expect(sectorA.id).not.toBe(sectorB.id);
    expect((await contextA.post('/master-data/sectors', { data: { name: 'Acabamento' } })).status()).toBe(409);

    const stageA = await (
      await contextA.post('/master-data/stages', {
        data: {
          name: 'Conferir',
          sectorId: sectorA.id,
          measurementUnitId: unitA.id,
          variableId: variableA.id,
          capacityPerWorkday: 80
        }
      })
    ).json();
    const stageB = await (
      await contextB.post('/master-data/stages', {
        data: {
          name: 'Conferir',
          sectorId: sectorB.id,
          measurementUnitId: unitB.id,
          variableId: variableB.id,
          capacityPerWorkday: 80
        }
      })
    ).json();
    expect(stageA.id).not.toBe(stageB.id);
    expect(
      (
        await contextA.post('/master-data/stages', {
          data: {
            name: 'Conferir',
            sectorId: sectorA.id,
            measurementUnitId: unitA.id,
            capacityPerWorkday: 80
          }
        })
      ).status()
    ).toBe(409);

    const templateA = await (
      await contextA.post('/master-data/templates', { data: { name: 'Fluxo Padrão', items: [{ stageId: stageA.id }] } })
    ).json();
    const templateB = await (
      await contextB.post('/master-data/templates', { data: { name: 'Fluxo Padrão', items: [{ stageId: stageB.id }] } })
    ).json();
    expect(templateA.id).not.toBe(templateB.id);
    expect((await contextA.post('/master-data/templates', { data: { name: 'Fluxo Padrão' } })).status()).toBe(409);

    const unitsA = await (await contextA.get('/master-data/measurement-units')).json();
    const unitsB = await (await contextB.get('/master-data/measurement-units')).json();
    const stagesA = await (await contextA.get('/master-data/stages')).json();
    const stagesB = await (await contextB.get('/master-data/stages')).json();
    const templatesA = await (await contextA.get('/master-data/templates')).json();
    const templatesB = await (await contextB.get('/master-data/templates')).json();

    expect(unitsA.map((unit: { id: string }) => unit.id)).toContain(unitA.id);
    expect(unitsA.map((unit: { id: string }) => unit.id)).not.toContain(unitB.id);
    expect(unitsB.map((unit: { id: string }) => unit.id)).toContain(unitB.id);
    expect(unitsB.map((unit: { id: string }) => unit.id)).not.toContain(unitA.id);
    expect(stagesA.map((stage: { id: string }) => stage.id)).toContain(stageA.id);
    expect(stagesA.map((stage: { id: string }) => stage.id)).not.toContain(stageB.id);
    expect(stagesB.map((stage: { id: string }) => stage.id)).toContain(stageB.id);
    expect(stagesB.map((stage: { id: string }) => stage.id)).not.toContain(stageA.id);
    expect(templatesA.map((template: { id: string }) => template.id)).toContain(templateA.id);
    expect(templatesA.map((template: { id: string }) => template.id)).not.toContain(templateB.id);
    expect(templatesB.map((template: { id: string }) => template.id)).toContain(templateB.id);
    expect(templatesB.map((template: { id: string }) => template.id)).not.toContain(templateA.id);
    expect((await contextA.patch(`/master-data/stages/${stageB.id}`, { data: { name: 'Invasão' } })).status()).toBe(404);

    const sizeA = await (await contextA.post('/master-data/sizes', { data: { name: 'M' } })).json();
    const sizeB = await (await contextB.post('/master-data/sizes', { data: { name: 'M' } })).json();
    expect(sizeA.id).not.toBe(sizeB.id);
    expect((await contextA.post('/master-data/sizes', { data: { name: 'M' } })).status()).toBe(409);

    const customerA = await (await contextA.post('/master-data/customers', { data: { name: 'Cliente Padrao', cpf: '12345678901' } })).json();
    const customerB = await (await contextB.post('/master-data/customers', { data: { name: 'Cliente Padrao', cpf: '12345678901' } })).json();
    expect(customerA.id).not.toBe(customerB.id);
    expect((await contextA.post('/master-data/customers', { data: { name: 'Outro Cliente', cpf: '12345678901' } })).status()).toBe(409);

    const productA = await (
      await contextA.post('/master-data/products', {
        data: {
          name: 'Camiseta',
          costPrice: 15,
          salePrice: 39.9,
          variableDefaults: [{ variableId: variableA.id, value: 2 }]
        }
      })
    ).json();
    const productB = await (
      await contextB.post('/master-data/products', {
        data: {
          name: 'Camiseta',
          costPrice: 15,
          salePrice: 39.9,
          variableDefaults: [{ variableId: variableB.id, value: 2 }]
        }
      })
    ).json();
    expect(productA.id).not.toBe(productB.id);
    expect((await contextA.post('/master-data/products', { data: { name: 'Camiseta', costPrice: 10, salePrice: 20 } })).status()).toBe(409);
    expect(
      (
        await contextA.post('/master-data/products', {
          data: { name: 'Produto Invasor', costPrice: 10, salePrice: 20, variableDefaults: [{ variableId: variableB.id, value: 1 }] }
        })
      ).status()
    ).toBe(400);

    const sizesA = await (await contextA.get('/master-data/sizes')).json();
    const sizesB = await (await contextB.get('/master-data/sizes')).json();
    const customersA = await (await contextA.get('/master-data/customers')).json();
    const customersB = await (await contextB.get('/master-data/customers')).json();
    const productsA = await (await contextA.get('/master-data/products')).json();
    const productsB = await (await contextB.get('/master-data/products')).json();

    expect(sizesA.map((size: { id: string }) => size.id)).toContain(sizeA.id);
    expect(sizesA.map((size: { id: string }) => size.id)).not.toContain(sizeB.id);
    expect(sizesB.map((size: { id: string }) => size.id)).toContain(sizeB.id);
    expect(customersA.map((customer: { id: string }) => customer.id)).toContain(customerA.id);
    expect(customersA.map((customer: { id: string }) => customer.id)).not.toContain(customerB.id);
    expect(customersB.map((customer: { id: string }) => customer.id)).toContain(customerB.id);
    expect(productsA.map((product: { id: string }) => product.id)).toContain(productA.id);
    expect(productsA.map((product: { id: string }) => product.id)).not.toContain(productB.id);
    expect(productsB.map((product: { id: string }) => product.id)).toContain(productB.id);

    await contextA.dispose();
    await contextB.dispose();
  });
});

import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type {
  ClothingSize,
  CreateClothingSizeInput,
  CreateCustomerInput,
  CreateMeasurementUnitInput,
  CreateProductInput,
  CreateSectorInput,
  CreateStageInput,
  CreateTemplateInput,
  CreateVariableInput,
  Customer,
  MeasurementUnit,
  Product,
  Sector,
  Stage,
  Template,
  UpdateClothingSizeInput,
  UpdateCustomerInput,
  UpdateMeasurementUnitInput,
  UpdateProductInput,
  UpdateSectorInput,
  UpdateStageInput,
  UpdateTemplateInput,
  UpdateVariableInput,
  Variable
} from '@trinus/contracts';
import { Roles } from '../auth/auth.decorators';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithAuth } from '../auth/auth.types';
import { RolesGuard } from '../auth/roles.guard';
import { MasterDataService } from './master-data.service';

@Controller('master-data')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('measurement-units')
  getMeasurementUnits(@Req() request: RequestWithAuth): Promise<MeasurementUnit[]> {
    return this.masterDataService.listMeasurementUnits(request.auth.user.companyId);
  }

  @Get('measurement-units/:id')
  async getMeasurementUnit(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<MeasurementUnit> {
    const record = await this.masterDataService.findMeasurementUnit(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Unidade de medida não encontrada.');
  }

  @Post('measurement-units')
  createMeasurementUnit(
    @Req() request: RequestWithAuth,
    @Body() body: CreateMeasurementUnitInput
  ): Promise<MeasurementUnit> {
    return this.masterDataService.createMeasurementUnit(request.auth.user.companyId, body);
  }

  @Patch('measurement-units/:id')
  async updateMeasurementUnit(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateMeasurementUnitInput
  ): Promise<MeasurementUnit> {
    const record = await this.masterDataService.updateMeasurementUnit(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Unidade de medida não encontrada.');
  }

  @Delete('measurement-units/:id')
  async deleteMeasurementUnit(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<MeasurementUnit> {
    const record = await this.masterDataService.deleteMeasurementUnit(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Unidade de medida não encontrada.');
  }

  @Get('variables')
  getVariables(@Req() request: RequestWithAuth): Promise<Variable[]> {
    return this.masterDataService.listVariables(request.auth.user.companyId);
  }

  @Get('variables/:id')
  async getVariable(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Variable> {
    const record = await this.masterDataService.findVariable(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Variável não encontrada.');
  }

  @Post('variables')
  createVariable(@Req() request: RequestWithAuth, @Body() body: CreateVariableInput): Promise<Variable> {
    return this.masterDataService.createVariable(request.auth.user.companyId, body);
  }

  @Patch('variables/:id')
  async updateVariable(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateVariableInput
  ): Promise<Variable> {
    const record = await this.masterDataService.updateVariable(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Variável não encontrada.');
  }

  @Delete('variables/:id')
  async deleteVariable(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Variable> {
    const record = await this.masterDataService.deleteVariable(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Variável não encontrada.');
  }

  @Get('sizes')
  getSizes(@Req() request: RequestWithAuth): Promise<ClothingSize[]> {
    return this.masterDataService.listSizes(request.auth.user.companyId);
  }

  @Get('sizes/:id')
  async getSize(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<ClothingSize> {
    const record = await this.masterDataService.findSize(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Tamanho nao encontrado.');
  }

  @Post('sizes')
  createSize(@Req() request: RequestWithAuth, @Body() body: CreateClothingSizeInput): Promise<ClothingSize> {
    return this.masterDataService.createSize(request.auth.user.companyId, body);
  }

  @Patch('sizes/:id')
  async updateSize(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateClothingSizeInput
  ): Promise<ClothingSize> {
    const record = await this.masterDataService.updateSize(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Tamanho nao encontrado.');
  }

  @Delete('sizes/:id')
  async deleteSize(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<ClothingSize> {
    const record = await this.masterDataService.deleteSize(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Tamanho nao encontrado.');
  }

  @Get('sectors')
  getSectors(@Req() request: RequestWithAuth): Promise<Sector[]> {
    return this.masterDataService.listSectors(request.auth.user.companyId);
  }

  @Get('sectors/:id')
  async getSector(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Sector> {
    const record = await this.masterDataService.findSector(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Setor não encontrado.');
  }

  @Post('sectors')
  createSector(@Req() request: RequestWithAuth, @Body() body: CreateSectorInput): Promise<Sector> {
    return this.masterDataService.createSector(request.auth.user.companyId, body);
  }

  @Patch('sectors/:id')
  async updateSector(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateSectorInput
  ): Promise<Sector> {
    const record = await this.masterDataService.updateSector(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Setor não encontrado.');
  }

  @Delete('sectors/:id')
  async deleteSector(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Sector> {
    const record = await this.masterDataService.deleteSector(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Setor não encontrado.');
  }

  @Get('stages')
  getStages(@Req() request: RequestWithAuth): Promise<Stage[]> {
    return this.masterDataService.listStages(request.auth.user.companyId);
  }

  @Get('stages/:id')
  async getStage(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Stage> {
    const record = await this.masterDataService.findStage(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Etapa não encontrada.');
  }

  @Post('stages')
  createStage(@Req() request: RequestWithAuth, @Body() body: CreateStageInput): Promise<Stage> {
    return this.masterDataService.createStage(request.auth.user.companyId, body);
  }

  @Patch('stages/:id')
  async updateStage(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateStageInput
  ): Promise<Stage> {
    const record = await this.masterDataService.updateStage(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Etapa não encontrada.');
  }

  @Delete('stages/:id')
  async deleteStage(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Stage> {
    const record = await this.masterDataService.deleteStage(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Etapa não encontrada.');
  }

  @Get('templates')
  getTemplates(@Req() request: RequestWithAuth): Promise<Template[]> {
    return this.masterDataService.listTemplates(request.auth.user.companyId);
  }

  @Get('templates/:id')
  async getTemplate(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Template> {
    const record = await this.masterDataService.findTemplate(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Template não encontrado.');
  }

  @Post('templates')
  createTemplate(@Req() request: RequestWithAuth, @Body() body: CreateTemplateInput): Promise<Template> {
    return this.masterDataService.createTemplate(request.auth.user.companyId, body);
  }

  @Patch('templates/:id')
  async updateTemplate(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateTemplateInput
  ): Promise<Template> {
    const record = await this.masterDataService.updateTemplate(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Template não encontrado.');
  }

  @Delete('templates/:id')
  async deleteTemplate(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Template> {
    const record = await this.masterDataService.deleteTemplate(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Template não encontrado.');
  }

  @Get('customers')
  getCustomers(@Req() request: RequestWithAuth): Promise<Customer[]> {
    return this.masterDataService.listCustomers(request.auth.user.companyId);
  }

  @Get('customers/:id')
  async getCustomer(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Customer> {
    const record = await this.masterDataService.findCustomer(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Cliente nao encontrado.');
  }

  @Post('customers')
  createCustomer(@Req() request: RequestWithAuth, @Body() body: CreateCustomerInput): Promise<Customer> {
    return this.masterDataService.createCustomer(request.auth.user.companyId, body);
  }

  @Patch('customers/:id')
  async updateCustomer(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateCustomerInput
  ): Promise<Customer> {
    const record = await this.masterDataService.updateCustomer(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Cliente nao encontrado.');
  }

  @Delete('customers/:id')
  async deleteCustomer(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Customer> {
    const record = await this.masterDataService.deleteCustomer(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Cliente nao encontrado.');
  }

  @Get('products')
  getProducts(@Req() request: RequestWithAuth): Promise<Product[]> {
    return this.masterDataService.listProducts(request.auth.user.companyId);
  }

  @Get('products/:id')
  async getProduct(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Product> {
    const record = await this.masterDataService.findProduct(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Produto nao encontrado.');
  }

  @Post('products')
  createProduct(@Req() request: RequestWithAuth, @Body() body: CreateProductInput): Promise<Product> {
    return this.masterDataService.createProduct(request.auth.user.companyId, body);
  }

  @Patch('products/:id')
  async updateProduct(
    @Req() request: RequestWithAuth,
    @Param('id') id: string,
    @Body() body: UpdateProductInput
  ): Promise<Product> {
    const record = await this.masterDataService.updateProduct(request.auth.user.companyId, id, body);
    return this.returnOrThrow(record, 'Produto nao encontrado.');
  }

  @Delete('products/:id')
  async deleteProduct(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Product> {
    const record = await this.masterDataService.deleteProduct(request.auth.user.companyId, id);
    return this.returnOrThrow(record, 'Produto nao encontrado.');
  }

  private returnOrThrow<T>(record: T | null, message: string): T {
    if (record === null) {
      throw new NotFoundException(message);
    }

    return record;
  }
}

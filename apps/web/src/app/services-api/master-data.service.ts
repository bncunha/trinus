import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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
import { Observable } from 'rxjs';
import { getApiBaseUrl } from './api-url';

const masterDataApiUrl = (path: string) => `${getApiBaseUrl()}/master-data/${path}`;

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly http = inject(HttpClient);

  listMeasurementUnits(): Observable<MeasurementUnit[]> {
    return this.http.get<MeasurementUnit[]>(masterDataApiUrl('measurement-units'), { withCredentials: true });
  }

  createMeasurementUnit(input: CreateMeasurementUnitInput): Observable<MeasurementUnit> {
    return this.http.post<MeasurementUnit>(masterDataApiUrl('measurement-units'), input, { withCredentials: true });
  }

  updateMeasurementUnit(id: string, input: UpdateMeasurementUnitInput): Observable<MeasurementUnit> {
    return this.http.patch<MeasurementUnit>(masterDataApiUrl(`measurement-units/${id}`), input, { withCredentials: true });
  }

  deleteMeasurementUnit(id: string): Observable<MeasurementUnit> {
    return this.http.delete<MeasurementUnit>(masterDataApiUrl(`measurement-units/${id}`), { withCredentials: true });
  }

  listVariables(): Observable<Variable[]> {
    return this.http.get<Variable[]>(masterDataApiUrl('variables'), { withCredentials: true });
  }

  createVariable(input: CreateVariableInput): Observable<Variable> {
    return this.http.post<Variable>(masterDataApiUrl('variables'), input, { withCredentials: true });
  }

  updateVariable(id: string, input: UpdateVariableInput): Observable<Variable> {
    return this.http.patch<Variable>(masterDataApiUrl(`variables/${id}`), input, { withCredentials: true });
  }

  deleteVariable(id: string): Observable<Variable> {
    return this.http.delete<Variable>(masterDataApiUrl(`variables/${id}`), { withCredentials: true });
  }

  listSizes(): Observable<ClothingSize[]> {
    return this.http.get<ClothingSize[]>(masterDataApiUrl('sizes'), { withCredentials: true });
  }

  createSize(input: CreateClothingSizeInput): Observable<ClothingSize> {
    return this.http.post<ClothingSize>(masterDataApiUrl('sizes'), input, { withCredentials: true });
  }

  updateSize(id: string, input: UpdateClothingSizeInput): Observable<ClothingSize> {
    return this.http.patch<ClothingSize>(masterDataApiUrl(`sizes/${id}`), input, { withCredentials: true });
  }

  deleteSize(id: string): Observable<ClothingSize> {
    return this.http.delete<ClothingSize>(masterDataApiUrl(`sizes/${id}`), { withCredentials: true });
  }

  listSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(masterDataApiUrl('sectors'), { withCredentials: true });
  }

  createSector(input: CreateSectorInput): Observable<Sector> {
    return this.http.post<Sector>(masterDataApiUrl('sectors'), input, { withCredentials: true });
  }

  updateSector(id: string, input: UpdateSectorInput): Observable<Sector> {
    return this.http.patch<Sector>(masterDataApiUrl(`sectors/${id}`), input, { withCredentials: true });
  }

  deleteSector(id: string): Observable<Sector> {
    return this.http.delete<Sector>(masterDataApiUrl(`sectors/${id}`), { withCredentials: true });
  }

  listStages(): Observable<Stage[]> {
    return this.http.get<Stage[]>(masterDataApiUrl('stages'), { withCredentials: true });
  }

  createStage(input: CreateStageInput): Observable<Stage> {
    return this.http.post<Stage>(masterDataApiUrl('stages'), input, { withCredentials: true });
  }

  updateStage(id: string, input: UpdateStageInput): Observable<Stage> {
    return this.http.patch<Stage>(masterDataApiUrl(`stages/${id}`), input, { withCredentials: true });
  }

  deleteStage(id: string): Observable<Stage> {
    return this.http.delete<Stage>(masterDataApiUrl(`stages/${id}`), { withCredentials: true });
  }

  listTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(masterDataApiUrl('templates'), { withCredentials: true });
  }

  createTemplate(input: CreateTemplateInput): Observable<Template> {
    return this.http.post<Template>(masterDataApiUrl('templates'), input, { withCredentials: true });
  }

  updateTemplate(id: string, input: UpdateTemplateInput): Observable<Template> {
    return this.http.patch<Template>(masterDataApiUrl(`templates/${id}`), input, { withCredentials: true });
  }

  deleteTemplate(id: string): Observable<Template> {
    return this.http.delete<Template>(masterDataApiUrl(`templates/${id}`), { withCredentials: true });
  }

  listCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(masterDataApiUrl('customers'), { withCredentials: true });
  }

  createCustomer(input: CreateCustomerInput): Observable<Customer> {
    return this.http.post<Customer>(masterDataApiUrl('customers'), input, { withCredentials: true });
  }

  updateCustomer(id: string, input: UpdateCustomerInput): Observable<Customer> {
    return this.http.patch<Customer>(masterDataApiUrl(`customers/${id}`), input, { withCredentials: true });
  }

  deleteCustomer(id: string): Observable<Customer> {
    return this.http.delete<Customer>(masterDataApiUrl(`customers/${id}`), { withCredentials: true });
  }

  listProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(masterDataApiUrl('products'), { withCredentials: true });
  }

  createProduct(input: CreateProductInput): Observable<Product> {
    return this.http.post<Product>(masterDataApiUrl('products'), input, { withCredentials: true });
  }

  updateProduct(id: string, input: UpdateProductInput): Observable<Product> {
    return this.http.patch<Product>(masterDataApiUrl(`products/${id}`), input, { withCredentials: true });
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(masterDataApiUrl(`products/${id}`), { withCredentials: true });
  }
}

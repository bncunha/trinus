import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CreateMeasurementUnitInput,
  CreateSectorInput,
  CreateStageInput,
  CreateTemplateInput,
  CreateVariableInput,
  MeasurementUnit,
  Sector,
  Stage,
  Template,
  UpdateMeasurementUnitInput,
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
}

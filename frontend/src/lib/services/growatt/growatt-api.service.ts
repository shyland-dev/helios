import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { DebugService } from '@shyland-dev/utils';

import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints.const';
import {
  ApiResponse,
  GrowattApiError,
  PaginatedResponse,
  EnergyHistoryParams,
  DeviceEnergyHistoryParams,
  ReadParameterParams,
  WriteParameterParams,
} from '../../types/api.type';
import { PlantListData, PlantEnergyOverview, PlantEnergyHistory } from '../../types/plant.type';
import {
  DeviceListData,
  MinEnergy,
  MinDetail,
  MinEnergyHistory,
  SphEnergy,
  SphDetail,
  SphEnergyHistory,
  DeviceParameter,
} from '../../types/device.type';

// Intervalo mínimo entre requests ao mesmo endpoint (em ms)
// Documentação Growatt: "Get the frequency once every 5 minutes"
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class GrowattApiService {
  private http = inject(HttpClient);
  private debugService = inject(DebugService);
  private baseUrl = environment.apiBaseUrl;

  // Cache interno: chave = endpoint+params, valor = resposta + timestamp
  private cache = new Map<string, CacheEntry<unknown>>();

  // ─── Cache/Throttle ─────────────────────────────────────────────────────────

  // Gera chave de cache baseada na URL e parâmetros
  private cacheKey(endpoint: string, params?: Record<string, string>): string {
    const paramStr = params
      ? Object.entries(params)
          .sort()
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      : '';
    return `${endpoint}?${paramStr}`;
  }

  // Verifica se o cache é válido (menos de 5 minutos)
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age >= CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    this.debugService.log(this, `cache hit [${key}] age=${Math.round(age / 1000)}s`);
    return entry.data;
  }

  // Salva no cache
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Executa request com cache/throttle: retorna cache se válido, senão faz request real
  private cachedRequest<T>(key: string, request$: Observable<T>): Observable<T> {
    const cached = this.getCached<T>(key);
    if (cached !== null) {
      return of(cached);
    }
    return request$.pipe(tap((response) => this.setCache(key, response)));
  }

  // Valida error_code da resposta e lança erro se != 0
  private validateResponse<T>(source: Observable<ApiResponse<T>>): Observable<ApiResponse<T>> {
    return source.pipe(
      map((response) => {
        if (response.error_code !== 0) {
          throw new GrowattApiError(response.error_code, response.error_msg);
        }
        return response;
      }),
    );
  }

  // Limpar cache manualmente (útil para forçar refresh)
  clearCache(): void {
    this.cache.clear();
    this.debugService.log(this, 'cache cleared');
  }

  // Tempo restante até o cache expirar para um endpoint (em segundos)
  getCacheRemainingSeconds(endpoint: string, params?: Record<string, string>): number {
    const key = this.cacheKey(endpoint, params);
    const entry = this.cache.get(key);
    if (!entry) return 0;

    const remaining = CACHE_TTL_MS - (Date.now() - entry.timestamp);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  // ─── Plantas ────────────────────────────────────────────────────────────────

  getPlantList(): Observable<ApiResponse<PlantListData>> {
    const key = this.cacheKey(API_ENDPOINTS.PLANT_LIST);
    return this.cachedRequest(
      key,
      this.validateResponse(this.http.get<ApiResponse<PlantListData>>(`${this.baseUrl}${API_ENDPOINTS.PLANT_LIST}`)),
    );
  }

  getPlantEnergyOverview(plantId: string): Observable<ApiResponse<PlantEnergyOverview>> {
    const key = this.cacheKey(API_ENDPOINTS.PLANT_DATA, { plant_id: plantId });
    const params = new HttpParams().set('plant_id', plantId);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<PlantEnergyOverview>>(`${this.baseUrl}${API_ENDPOINTS.PLANT_DATA}`, { params }),
      ),
    );
  }

  getPlantEnergyHistory(
    plantId: string,
    historyParams: EnergyHistoryParams,
  ): Observable<PaginatedResponse<PlantEnergyHistory>> {
    const cacheParams = {
      plant_id: plantId,
      start_date: historyParams.start_date,
      end_date: historyParams.end_date,
      ...(historyParams.time_unit && { time_unit: historyParams.time_unit }),
      ...(historyParams.page && { page: historyParams.page.toString() }),
    };
    const key = this.cacheKey(API_ENDPOINTS.PLANT_ENERGY_HISTORY, cacheParams);

    let params = new HttpParams()
      .set('plant_id', plantId)
      .set('start_date', historyParams.start_date)
      .set('end_date', historyParams.end_date);
    if (historyParams.time_unit) params = params.set('time_unit', historyParams.time_unit);
    if (historyParams.page) params = params.set('page', historyParams.page.toString());
    if (historyParams.perpage) params = params.set('perpage', historyParams.perpage.toString());

    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<PaginatedResponse<PlantEnergyHistory>>(`${this.baseUrl}${API_ENDPOINTS.PLANT_ENERGY_HISTORY}`, {
          params,
        }),
      ),
    );
  }

  // ─── Dispositivos ───────────────────────────────────────────────────────────

  getDeviceList(plantId: string): Observable<ApiResponse<DeviceListData>> {
    const key = this.cacheKey(API_ENDPOINTS.DEVICE_LIST, { plant_id: plantId });
    const params = new HttpParams().set('plant_id', plantId);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<DeviceListData>>(`${this.baseUrl}${API_ENDPOINTS.DEVICE_LIST}`, { params }),
      ),
    );
  }

  // ─── MIN (TLX) ──────────────────────────────────────────────────────────────

  getMinEnergy(deviceSn: string): Observable<ApiResponse<MinEnergy>> {
    const key = this.cacheKey(API_ENDPOINTS.MIN_ENERGY, { device_sn: deviceSn });
    const params = new HttpParams().set('device_sn', deviceSn);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<MinEnergy>>(`${this.baseUrl}${API_ENDPOINTS.MIN_ENERGY}`, { params }),
      ),
    );
  }

  getMinDetail(deviceSn: string): Observable<ApiResponse<MinDetail>> {
    const key = this.cacheKey(API_ENDPOINTS.MIN_DETAIL, { device_sn: deviceSn });
    const params = new HttpParams().set('device_sn', deviceSn);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<MinDetail>>(`${this.baseUrl}${API_ENDPOINTS.MIN_DETAIL}`, { params }),
      ),
    );
  }

  getMinEnergyHistory(
    deviceSn: string,
    historyParams?: DeviceEnergyHistoryParams,
  ): Observable<ApiResponse<MinEnergyHistory[]>> {
    const cacheParams: Record<string, string> = { device_sn: deviceSn };
    if (historyParams?.start_date) cacheParams['start_date'] = historyParams.start_date;
    if (historyParams?.end_date) cacheParams['end_date'] = historyParams.end_date;
    const key = this.cacheKey(API_ENDPOINTS.MIN_ENERGY_HISTORY, cacheParams);

    let params = new HttpParams().set('device_sn', deviceSn);
    if (historyParams?.start_date) params = params.set('start_date', historyParams.start_date);
    if (historyParams?.end_date) params = params.set('end_date', historyParams.end_date);
    if (historyParams?.timezone) params = params.set('timezone', historyParams.timezone);
    if (historyParams?.page) params = params.set('page', historyParams.page.toString());
    if (historyParams?.limit) params = params.set('limit', historyParams.limit.toString());

    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<MinEnergyHistory[]>>(`${this.baseUrl}${API_ENDPOINTS.MIN_ENERGY_HISTORY}`, {
          params,
        }),
      ),
    );
  }

  getMinSettings(deviceSn: string): Observable<ApiResponse<Record<string, unknown>>> {
    const key = this.cacheKey(API_ENDPOINTS.MIN_SETTINGS, { device_sn: deviceSn });
    const params = new HttpParams().set('device_sn', deviceSn);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<Record<string, unknown>>>(`${this.baseUrl}${API_ENDPOINTS.MIN_SETTINGS}`, { params }),
      ),
    );
  }

  minReadParameter(deviceSn: string, readParams: ReadParameterParams): Observable<ApiResponse<DeviceParameter>> {
    const cacheParams: Record<string, string> = { device_sn: deviceSn, parameter_id: readParams.parameter_id };
    const key = this.cacheKey(API_ENDPOINTS.MIN_READ_PARAMETER, cacheParams);

    let params = new HttpParams().set('device_sn', deviceSn).set('parameter_id', readParams.parameter_id);
    if (readParams.start_address != null) params = params.set('start_address', readParams.start_address.toString());
    if (readParams.end_address != null) params = params.set('end_address', readParams.end_address.toString());

    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<DeviceParameter>>(`${this.baseUrl}${API_ENDPOINTS.MIN_READ_PARAMETER}`, { params }),
      ),
    );
  }

  // Write não tem cache (operação de escrita)
  minWriteParameter(deviceSn: string, writeParams: WriteParameterParams): Observable<ApiResponse<unknown>> {
    const body = {
      device_sn: deviceSn,
      parameter_id: writeParams.parameter_id,
      parameter_values: writeParams.parameter_values,
    };
    return this.validateResponse(
      this.http.post<ApiResponse<unknown>>(`${this.baseUrl}${API_ENDPOINTS.MIN_WRITE_PARAMETER}`, body),
    );
  }

  // ─── SPH (MIX) ──────────────────────────────────────────────────────────────

  getSphEnergy(deviceSn: string): Observable<ApiResponse<SphEnergy>> {
    const key = this.cacheKey(API_ENDPOINTS.SPH_ENERGY, { device_sn: deviceSn });
    const params = new HttpParams().set('device_sn', deviceSn);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<SphEnergy>>(`${this.baseUrl}${API_ENDPOINTS.SPH_ENERGY}`, { params }),
      ),
    );
  }

  getSphDetail(deviceSn: string): Observable<ApiResponse<SphDetail>> {
    const key = this.cacheKey(API_ENDPOINTS.SPH_DETAIL, { device_sn: deviceSn });
    const params = new HttpParams().set('device_sn', deviceSn);
    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<SphDetail>>(`${this.baseUrl}${API_ENDPOINTS.SPH_DETAIL}`, { params }),
      ),
    );
  }

  getSphEnergyHistory(
    deviceSn: string,
    historyParams?: DeviceEnergyHistoryParams,
  ): Observable<ApiResponse<SphEnergyHistory[]>> {
    const cacheParams: Record<string, string> = { device_sn: deviceSn };
    if (historyParams?.start_date) cacheParams['start_date'] = historyParams.start_date;
    if (historyParams?.end_date) cacheParams['end_date'] = historyParams.end_date;
    const key = this.cacheKey(API_ENDPOINTS.SPH_ENERGY_HISTORY, cacheParams);

    let params = new HttpParams().set('device_sn', deviceSn);
    if (historyParams?.start_date) params = params.set('start_date', historyParams.start_date);
    if (historyParams?.end_date) params = params.set('end_date', historyParams.end_date);
    if (historyParams?.timezone) params = params.set('timezone', historyParams.timezone);
    if (historyParams?.page) params = params.set('page', historyParams.page.toString());
    if (historyParams?.limit) params = params.set('limit', historyParams.limit.toString());

    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<SphEnergyHistory[]>>(`${this.baseUrl}${API_ENDPOINTS.SPH_ENERGY_HISTORY}`, {
          params,
        }),
      ),
    );
  }

  sphReadParameter(
    deviceSn: string,
    readParams?: Partial<ReadParameterParams>,
  ): Observable<ApiResponse<DeviceParameter>> {
    const cacheParams: Record<string, string> = { device_sn: deviceSn };
    if (readParams?.parameter_id) cacheParams['parameter_id'] = readParams.parameter_id;
    const key = this.cacheKey(API_ENDPOINTS.SPH_READ_PARAMETER, cacheParams);

    let params = new HttpParams().set('device_sn', deviceSn);
    if (readParams?.parameter_id) params = params.set('parameter_id', readParams.parameter_id);
    if (readParams?.start_address != null) params = params.set('start_address', readParams.start_address.toString());
    if (readParams?.end_address != null) params = params.set('end_address', readParams.end_address.toString());

    return this.cachedRequest(
      key,
      this.validateResponse(
        this.http.get<ApiResponse<DeviceParameter>>(`${this.baseUrl}${API_ENDPOINTS.SPH_READ_PARAMETER}`, { params }),
      ),
    );
  }

  // Write não tem cache (operação de escrita)
  sphWriteParameter(deviceSn: string, writeParams: WriteParameterParams): Observable<ApiResponse<unknown>> {
    const body = {
      device_sn: deviceSn,
      parameter_id: writeParams.parameter_id,
      parameter_values: writeParams.parameter_values,
    };
    return this.validateResponse(
      this.http.post<ApiResponse<unknown>>(`${this.baseUrl}${API_ENDPOINTS.SPH_WRITE_PARAMETER}`, body),
    );
  }
}

// Tipos genéricos de resposta da API Growatt

export interface ApiResponse<T> {
  error_code: number;
  error_msg: string;
  data: T;
}

// Erro customizado para respostas com error_code != 0
export class GrowattApiError extends Error {
  readonly errorCode: number;
  readonly errorMsg: string;

  constructor(errorCode: number, errorMsg: string) {
    super(`[Growatt API Error ${errorCode}] ${errorMsg}`);
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
    this.name = 'GrowattApiError';
  }
}

export interface PaginatedData<T> {
  count: number;
  data: T[];
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export type TimeUnit = 'day' | 'month' | 'year';

export interface EnergyHistoryParams {
  start_date: string;
  end_date: string;
  time_unit?: TimeUnit;
  page?: number;
  perpage?: number;
}

export interface DeviceEnergyHistoryParams {
  start_date?: string;
  end_date?: string;
  timezone?: string;
  page?: number;
  limit?: number;
}

export interface ReadParameterParams {
  parameter_id: string;
  start_address?: number;
  end_address?: number;
}

export interface WriteParameterParams {
  parameter_id: string;
  parameter_values: Record<string, unknown> | unknown[];
}
